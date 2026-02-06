const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    // Student and Course
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Courses',
            key: 'id'
        }
    },

    // Enrollment Status per requirements
    status: {
        type: DataTypes.ENUM('active', 'dropped', 'completed', 'pending'),
        defaultValue: 'active'
    },

    // Enrollment Method
    enrollmentMethod: {
        type: DataTypes.ENUM('class', 'individual', 'csv_import', 'self_enroll'),
        defaultValue: 'individual'
    },

    // Dates
    enrolledAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    droppedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // Progress Tracking
    progress: {
        type: DataTypes.JSON,
        defaultValue: {
            lecturesCompleted: 0,
            totalLectures: 0,
            labsCompleted: 0,
            totalLabs: 0,
            percentComplete: 0
        }
    },

    // Grades
    currentGrade: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    letterGrade: {
        type: DataTypes.STRING,
        allowNull: true // 'A', 'B', 'C', etc.
    },

    // Final Grade Components (calculated from gradingScheme)
    lectureGrade: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    labGrade: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    examGrade: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },

    // Attendance tracking
    lastAccessedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    totalTimeSpent: {
        type: DataTypes.INTEGER, // minutes
        defaultValue: 0
    },

    // Notes from teacher
    teacherNotes: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Enrolled by (admin or teacher)
    enrolledBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['courseId'] },
        { fields: ['status'] },
        { unique: true, fields: ['userId', 'courseId'] } // One enrollment per student per course
    ]
});

module.exports = Enrollment;