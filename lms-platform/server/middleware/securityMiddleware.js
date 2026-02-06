const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

/**
 * Security Middleware Configuration
 * Per requirements: XSS, CSRF, SQL Injection prevention
 */

/**
 * Helmet - Security headers
 */
const helmetMiddleware = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Monaco editor needs unsafe-inline
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:5173']
        }
    },
    crossOriginEmbedderPolicy: false, // Required for Monaco editor
    crossOriginResourcePolicy: { policy: 'cross-origin' }
});

/**
 * CORS Configuration
 */
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            process.env.FRONTEND_URL
        ].filter(Boolean);

        // Allow requests with no origin (mobile apps, Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

/**
 * NoSQL Injection Prevention
 * Even though we use SQL, this sanitizes $ and . from user input
 */
const sanitizeData = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized key: ${key} in request from IP: ${req.ip}`);
    }
});

/**
 * SQL Injection Prevention Middleware
 * Log suspicious patterns in user input
 */
const sqlInjectionDetection = (req, res, next) => {
    const suspiciousPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
        /(--|\b(OR|AND)\b.*=)/i,
        /('|("|`);?\s*(OR|AND)\s*('|"|`)?\d+('|"|`)?\s*=\s*('|"|`)?\d+)/i,
        /(UNION.*SELECT|SELECT.*FROM.*WHERE)/i
    ];

    const checkValue = (value, path = '') => {
        if (typeof value === 'string') {
            for (const pattern of suspiciousPatterns) {
                if (pattern.test(value)) {
                    console.warn(`SQL injection attempt detected: ${path}`, {
                        ip: req.ip,
                        value,
                        user: req.user?.id
                    });
                    // Log but don't block - parameterized queries handle this
                }
            }
        } else if (typeof value === 'object' && value !== null) {
            for (const key in value) {
                checkValue(value[key], `${path}.${key}`);
            }
        }
    };

    if (req.body) checkValue(req.body, 'body');
    if (req.query) checkValue(req.query, 'query');
    if (req.params) checkValue(req.params, 'params');

    next();
};

/**
 * XSS Prevention - Additional layer
 * Note: sanitize-html is used in validationMiddleware
 */
const xssProtection = (req, res, next) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
};

/**
 * Request size limits
 */
const requestSizeLimits = {
    json: '10mb', // For API requests
    urlencoded: '10mb',
    file: 50 * 1024 * 1024 // 50MB for file uploads
};

/**
 * IP Whitelisting/Blacklisting (optional)
 */
const ipBlacklist = new Set([
    // Add malicious IPs here
]);

const ipFilter = (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;

    if (ipBlacklist.has(clientIp)) {
        console.warn(`Blocked request from blacklisted IP: ${clientIp}`);
        return res.status(403).json({ message: 'Access denied' });
    }

    next();
};

/**
 * Request ID for tracking
 */
const requestId = (req, res, next) => {
    req.id = require('crypto').randomUUID();
    res.setHeader('X-Request-ID', req.id);
    next();
};

/**
 * Security Audit Logger
 */
const securityLogger = (req, res, next) => {
    // Log sensitive operations
    const sensitiveRoutes = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/password',
        '/api/users/delete'
    ];

    if (sensitiveRoutes.some(route => req.path.startsWith(route))) {
        console.log({
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            userId: req.user?.id
        });
    }

    next();
};

/**
 * Prevent Parameter Pollution
 */
const preventParameterPollution = (req, res, next) => {
    // Convert array parameters to single values (take first)
    for (const key in req.query) {
        if (Array.isArray(req.query[key])) {
            req.query[key] = req.query[key][0];
        }
    }
    next();
};

/**
 * Complete security middleware stack
 */
const securityMiddlewareStack = [
    helmetMiddleware,
    xssProtection,
    sanitizeData,
    sqlInjectionDetection,
    ipFilter,
    requestId,
    securityLogger,
    preventParameterPollution
];

module.exports = {
    helmetMiddleware,
    corsOptions,
    sanitizeData,
    sqlInjectionDetection,
    xssProtection,
    requestSizeLimits,
    ipFilter,
    requestId,
    securityLogger,
    preventParameterPollution,
    securityMiddlewareStack
};