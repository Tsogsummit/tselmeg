const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    courseCode: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null for existing data, but should be unique
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    semester: {
        type: DataTypes.STRING,
        allowNull: true
    },
    credits: {
        type: DataTypes.INTEGER,
        defaultValue: 3
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    thumbnail: {
        type: DataTypes.STRING, // URL or Path
        allowNull: true
    },
    syllabus: {
        type: DataTypes.STRING, // URL or Path
        allowNull: true
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    maxStudents: {
        type: DataTypes.INTEGER,
        defaultValue: 50
    },
    allowLateSubmission: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    latePenalty: {
        type: DataTypes.INTEGER, // Percentage per day, e.g., 10
        defaultValue: 0
    },
    gradingScheme: {
        type: DataTypes.JSON, // Stores { lectures: 20, labs: 40, finalExam: 40 }
        defaultValue: { lectures: 20, labs: 40, finalExam: 40 }
    }
});

module.exports = Course;
