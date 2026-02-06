const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    // Recipient
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },

    // Notification Type
    type: {
        type: DataTypes.ENUM(
            'assignment_graded',
            'new_assignment',
            'deadline_reminder',
            'course_announcement',
            'exam_scheduled',
            'password_changed',
            'enrollment_confirmed',
            'system_alert'
        ),
        allowNull: false
    },

    // Content
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    // Related entity (polymorphic)
    relatedType: {
        type: DataTypes.ENUM('course', 'lecture', 'lab', 'exam', 'submission', 'none'),
        defaultValue: 'none'
    },
    relatedId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    // Status
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // Priority
    priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        defaultValue: 'normal'
    },

    // Action URL (optional link)
    actionUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    actionText: {
        type: DataTypes.STRING,
        allowNull: true // e.g., "View Grade", "Take Quiz"
    },

    // Delivery channels
    channels: {
        type: DataTypes.JSON,
        defaultValue: {
            inApp: true,
            email: false,
            push: false
        }
    },

    // Email sent status
    emailSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    emailSentAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // Expiration (auto-delete old notifications)
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['type'] },
        { fields: ['isRead'] },
        { fields: ['priority'] },
        { fields: ['createdAt'] }
    ]
});

module.exports = Notification;