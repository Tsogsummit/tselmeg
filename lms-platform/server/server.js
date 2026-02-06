require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const { sequelize } = require('./models');
const path = require('path');

// Security middleware
const {
    securityMiddlewareStack,
    corsOptions,
    requestSizeLimits
} = require('./middleware/securityMiddleware');
const { apiLimiter, ipLimiter } = require('./middleware/ratelimitMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// Request logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Security middleware stack
app.use(securityMiddlewareStack);

// CORS
app.use(cors(corsOptions));

// Compression
app.use(compression());

// IP-based rate limiting (first layer)
app.use(ipLimiter);

// Body parsing with size limits
app.use(express.json({ limit: requestSizeLimits.json }));
app.use(express.urlencoded({
    extended: true,
    limit: requestSizeLimits.urlencoded
}));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint (no auth required)
app.get('/health', async (req, res) => {
    try {
        await sequelize.authenticate();

        // Check Docker availability
        const codeExecutionService = require('./services/codeExecutionService');
        const dockerAvailable = await codeExecutionService.testDocker();

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
            docker: dockerAvailable ? 'available' : 'unavailable',
            version: '2.0.0'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', apiLimiter, require('./routes/courseRoutes'));
app.use('/api/scores', apiLimiter, require('./routes/scoreRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes')); // Has its own rate limiter
app.use('/api/enrollments', apiLimiter, require('./routes/enrollmentRoutes'));
app.use('/api/notifications', apiLimiter, require('./routes/notificationRoutes'));
app.use('/api/announcements', apiLimiter, require('./routes/announcementRoutes'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: 'Endpoint not found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation error',
            errors: err.errors || err.message
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            message: 'Unauthorized',
            error: err.message
        });
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            message: 'Duplicate entry',
            field: err.errors?.[0]?.path
        });
    }

    // Default error
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

/**
 * Database connection and server startup
 */
const startServer = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✓ Database connected successfully');

        // Sync database (use migrations in production)
        if (process.env.NODE_ENV === 'development') {
            // Use alter to update schema without losing data
            await sequelize.sync({ alter: false });
            console.log('✓ Database synchronized');
        }

        // Test Docker availability
        const codeExecutionService = require('./services/codeExecutionService');
        const dockerAvailable = await codeExecutionService.testDocker();

        if (!dockerAvailable) {
            console.warn('⚠ Docker not available - code execution will fail');
            console.warn('  Install Docker: https://docs.docker.com/get-docker/');
        } else {
            console.log('✓ Docker available');

            // Pull required images (optional - can be slow)
            if (process.env.PULL_DOCKER_IMAGES === 'true') {
                console.log('Pulling Docker images...');
                await codeExecutionService.pullImages();
            }
        }

        // Start server
        app.listen(PORT, () => {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await sequelize.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    await sequelize.close();
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app; // For testing