require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads) if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/scores', require('./routes/scoreRoutes'));


// Database Sync and Server Start
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        // Sync models (force: false ensures we don't drop tables on restart, alter: true updates schema)
        // In production, use migrations. For this MVP, sync is fine.
        // Disable foreign keys check for SQLite to avoid constraint errors during alter
        await sequelize.query('PRAGMA foreign_keys = OFF;');
        await sequelize.query('DROP TABLE IF EXISTS `Courses_backup`;');
        await sequelize.query('DROP TABLE IF EXISTS `ClassCourses_backup`;');
        // Fix: avoid alter: true with SQLite for M:N relations to prevent UNIQUE constraint errors
        await sequelize.sync({ alter: false });
        await sequelize.query('PRAGMA foreign_keys = ON;');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
    }
};

startServer();
