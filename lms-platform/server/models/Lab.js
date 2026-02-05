const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lab = sequelize.define('Lab', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true
    },
    language: {
        type: DataTypes.ENUM('html', 'python', 'javascript', 'java', 'cpp'),
        defaultValue: 'javascript',
    },
    allowedAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: -1, // -1 means unlimited
    },
    instruction: {
        type: DataTypes.TEXT, // Markdown content or file path
        allowNull: true
    },
    starterCode: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    testCases: {
        type: DataTypes.JSON, // Array of test cases { input, expectedOutput, hidden }
        defaultValue: []
    },
    lectureId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Lab;
