const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lecture = sequelize.define('Lecture', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT, // Markdown or HTML description
        allowNull: true,
    },
    fileUrl: {
        type: DataTypes.STRING, // Path to PDF/Video
        allowNull: true,
    },
    order: {
        type: DataTypes.INTEGER, // Week number or sequence
        allowNull: false,
        defaultValue: 1,
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true, // Available from
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    durationMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 30, // Default 30 mins for quiz
    },
    isMandatory: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Lecture;
