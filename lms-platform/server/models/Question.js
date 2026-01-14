const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    options: {
        type: DataTypes.JSON, // Array of strings ["A", "B", "C"]
        allowNull: true,
    },
    correctAnswer: {
        type: DataTypes.STRING, // "A" or the exact text
        allowNull: false,
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    type: {
        type: DataTypes.ENUM('LECTURE_QUIZ', 'EXAM'), // Where does this question belong?
        defaultValue: 'LECTURE_QUIZ',
    }
});

module.exports = Question;
