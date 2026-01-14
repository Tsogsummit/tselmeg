const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClassGroup = sequelize.define('ClassGroup', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING, // e.g., '10a', '11b'
        unique: true,
        allowNull: false,
    },
    gradeLevel: {
        type: DataTypes.INTEGER, // 10, 11, 12
        allowNull: false,
    }
});

module.exports = ClassGroup;
