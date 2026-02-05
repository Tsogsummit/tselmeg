const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Submission = sequelize.define('Submission', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('LAB', 'EXAM'), // Where the code came from
        allowNull: false,
    },
    referenceId: {
        type: DataTypes.INTEGER, // LabId or ExamId
        allowNull: false,
    },
    codeContent: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'PASSED', 'FAILED'),
        defaultValue: 'PENDING',
    },
    submittedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    gradingDetails: {
        type: DataTypes.JSON, // Test case results
        allowNull: true
    },
    executionTime: {
        type: DataTypes.FLOAT, // milliseconds or seconds
        allowNull: true
    },
    memoryUsage: {
        type: DataTypes.FLOAT, // MB
        allowNull: true
    },
    score: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
});

module.exports = Submission;
