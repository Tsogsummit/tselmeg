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
    description: {
        type: DataTypes.TEXT, // Markdown description
        allowNull: true,
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    materials: {
        type: DataTypes.JSON, // Array of { type: 'pdf'|'video', url: '...', title: '...' }
        defaultValue: []
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    availableFrom: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    deadline: { // Optional deadline for viewing/quiz
        type: DataTypes.DATE,
        allowNull: true,
    },
    estimatedDuration: {
        type: DataTypes.INTEGER, // minutes
        defaultValue: 90,
    },
    mandatory: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Lecture;
