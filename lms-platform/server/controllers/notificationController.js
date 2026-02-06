const { Notification, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Get user's notifications
 */
exports.getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20, offset = 0, unreadOnly = false } = req.query;

        const where = { userId };
        if (unreadOnly === 'true') {
            where.isRead = false;
        }

        const notifications = await Notification.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            notifications: notifications.rows,
            total: notifications.count,
            unreadCount: await Notification.count({ where: { userId, isRead: false } })
        });

    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOne({
            where: { id, userId }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();

        res.json({ message: 'Notification marked as read', notification });

    } catch (error) {
        console.error('Mark Read Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.update(
            { isRead: true, readAt: new Date() },
            { where: { userId, isRead: false } }
        );

        res.json({ message: 'All notifications marked as read' });

    } catch (error) {
        console.error('Mark All Read Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Delete notification
 */
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await Notification.destroy({
            where: { id, userId }
        });

        if (result === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });

    } catch (error) {
        console.error('Delete Notification Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Create notification (internal use)
 */
exports.createNotification = async (userId, data) => {
    try {
        const notification = await Notification.create({
            userId,
            ...data
        });

        // TODO: Send real-time notification via WebSocket
        // TODO: Send email if channels.email is true

        return notification;

    } catch (error) {
        console.error('Create Notification Error:', error);
        throw error;
    }
};

/**
 * Create bulk notifications (e.g., for all course students)
 */
exports.createBulkNotifications = async (userIds, data) => {
    try {
        const notifications = userIds.map(userId => ({
            userId,
            ...data
        }));

        await Notification.bulkCreate(notifications);

    } catch (error) {
        console.error('Create Bulk Notifications Error:', error);
        throw error;
    }
};

/**
 * Clean up old notifications (cron job)
 */
exports.cleanupExpiredNotifications = async () => {
    try {
        const result = await Notification.destroy({
            where: {
                expiresAt: {
                    [Op.lt]: new Date()
                }
            }
        });

        console.log(`Cleaned up ${result} expired notifications`);

    } catch (error) {
        console.error('Cleanup Notifications Error:', error);
    }
};

module.exports = exports;