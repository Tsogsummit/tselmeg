const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LabTask = sequelize.define('LabTask', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    description: {
        type: DataTypes.TEXT, // Specific instructions for this task
        allowNull: false,
    },
    startingCode: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    expectedOutput: {
        type: DataTypes.TEXT,
        allowNull: true, // For auto-grading
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    labId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = LabTask;
