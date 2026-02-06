const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lecture = sequelize.define('Lecture', {
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
        type: DataTypes.TEXT, // Markdown description
        allowNull: true,
    },
    content: {
        type: DataTypes.TEXT, // Main lecture content (Markdown)
        allowNull: true,
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },

    // Materials - Array of material objects
    materials: {
        type: DataTypes.JSON,
        defaultValue: [],
        // Structure: [{ type: 'pdf'|'video'|'link', title: '', url: '', fileSize: 0 }]
    },

    // Points for completing lecture
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },

    // Availability Windows
    availableFrom: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    availableUntil: {
        type: DataTypes.DATE,
        allowNull: true, // Per requirements - null means no limit
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true, // Optional deadline for viewing/quiz
    },

    // Duration and Requirements
    estimatedDuration: {
        type: DataTypes.INTEGER, // minutes
        defaultValue: 90,
    },
    mandatory: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },

    // Quiz Configuration for this lecture
    hasQuiz: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    quizConfig: {
        type: DataTypes.JSON,
        defaultValue: null,
        // Structure per requirements:
        // {
        //   totalPoints: 20,
        //   passingScore: 14,
        //   duration: 30, // minutes
        //   attempts: 1,
        //   shuffleQuestions: true,
        //   showAnswersAfter: 'submission' | 'deadline' | 'never',
        //   startTime: '2024-09-05T10:00:00',
        //   deadline: '2024-09-12T23:59:59'
        // }
    },

    // File Uploads (PPT, PDF)
    attachments: {
        type: DataTypes.JSON,
        defaultValue: [],
        // Structure: [{ filename: '', filepath: '', fileSize: 0, mimeType: '' }]
    },

    // Status
    isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // Foreign Keys
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Courses',
            key: 'id'
        }
    },

    // Created By (Teacher)
    createdBy: {
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
        { fields: ['courseId'] },
        { fields: ['order'] },
        { fields: ['isPublished'] },
        { fields: ['availableFrom'] },
        { fields: ['availableUntil'] }
    ]
});

module.exports = Lecture;