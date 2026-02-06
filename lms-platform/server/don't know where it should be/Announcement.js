const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Announcement = sequelize.define('Announcement', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    // Course this announcement belongs to
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Courses',
            key: 'id'
        }
    },

    // Author (teacher/admin)
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },

    // Content
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    // Priority/Type
    priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        defaultValue: 'normal'
    },
    type: {
        type: DataTypes.ENUM('general', 'assignment', 'exam', 'schedule_change', 'resource'),
        defaultValue: 'general'
    },

    // Visibility
    isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // Pin to top
    isPinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    // Attachments
    attachments: {
        type: DataTypes.JSON,
        defaultValue: []
        // [{ filename: '', url: '', fileSize: 0 }]
    },

    // Notification settings
    notifyStudents: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    notifiedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // Expiration (for temporary announcements)
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // View tracking
    viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['courseId'] },
        { fields: ['authorId'] },
        { fields: ['isPublished'] },
        { fields: ['isPinned'] },
        { fields: ['priority'] },
        { fields: ['createdAt'] }
    ]
});

module.exports = Announcement;