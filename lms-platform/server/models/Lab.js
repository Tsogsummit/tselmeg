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
    maxScore: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
    },
    lectureId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Lab;
