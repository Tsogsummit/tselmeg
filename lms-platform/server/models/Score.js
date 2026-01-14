const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Score = sequelize.define('Score', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    score: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    maxScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('LECTURE', 'LAB', 'EXAM'),
        allowNull: false,
    },
    referenceId: {
        type: DataTypes.INTEGER, // ID of Lecture, Lab, or Exam
        allowNull: false,
    },
    feedback: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
});

module.exports = Score;
