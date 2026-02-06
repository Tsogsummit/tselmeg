const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizAttempt = sequelize.define('QuizAttempt', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    // Student taking the quiz
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },

    // Which lecture's quiz (polymorphic: could be lecture or exam)
    lectureId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Lectures',
            key: 'id'
        }
    },
    examId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Exams',
            key: 'id'
        }
    },

    // Attempt number
    attemptNumber: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },

    // Timing
    startedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    submittedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    timeSpent: {
        type: DataTypes.INTEGER, // seconds
        allowNull: true
    },

    // Status
    status: {
        type: DataTypes.ENUM('in_progress', 'submitted', 'graded', 'abandoned'),
        defaultValue: 'in_progress'
    },

    // Answers - Stores student responses
    answers: {
        type: DataTypes.JSON,
        defaultValue: {},
        // Structure:
        // {
        //   "questionId_1": { answer: "a", correct: true, points: 2 },
        //   "questionId_2": { answer: "false", correct: false, points: 0 }
        // }
    },

    // Grading
    score: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    maxScore: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    percentage: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    passed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    // Auto-graded or manual
    gradingMethod: {
        type: DataTypes.ENUM('automatic', 'manual', 'mixed'),
        defaultValue: 'automatic'
    },

    // Graded by (if manual)
    gradedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    gradedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // Feedback
    feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // IP and Browser for security
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userAgent: {
        type: DataTypes.STRING,
        allowNull: true
    },

    // Shuffled question order (if shuffling was enabled)
    questionOrder: {
        type: DataTypes.JSON,
        defaultValue: []
        // [3, 1, 4, 2] - IDs in the order presented to student
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['lectureId'] },
        { fields: ['examId'] },
        { fields: ['status'] },
        { fields: ['submittedAt'] }
    ]
});

module.exports = QuizAttempt;