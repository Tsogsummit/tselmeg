const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exam = sequelize.define('Exam', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('midterm', 'final', 'quiz'),
        defaultValue: 'midterm'
    },
    totalPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 100
    },
    duration: {
        type: DataTypes.INTEGER, // minutes
        defaultValue: 120
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    allowedResources: {
        type: DataTypes.JSON, // ['notes', 'textbook']
        defaultValue: []
    },
    proctored: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    structure: {
        type: DataTypes.JSON, // Sections and questions
        allowNull: true
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Exam;
