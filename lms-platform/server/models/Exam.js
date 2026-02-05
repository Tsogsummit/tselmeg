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
        type: DataTypes.ENUM('MIDTERM', 'FINAL', 'FUN', 'PROGRESS'),
        defaultValue: 'PROGRESS',
    },
    maxScore: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    durationMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 90,
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Exam;
