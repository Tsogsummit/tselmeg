const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true // Should be required for new users
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    studentId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('student', 'admin', 'teacher'),
        defaultValue: 'student',
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: true,
    }
});

module.exports = User;
