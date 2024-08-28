import {
    sendMessage as sendMessageService,
    getUserNotifications as getUserNotificationsService,
    markAsRead as markAsReadService,
    deleteNotification as deleteNotificationService
} from '../services/notificationService.js';

export const sendMessage = async (req, res) => {
    try {
        const { senderId, senderModel, receiverId, receiverModel, message } = req.body;
        console.log(`Sending message: ${message} from ${senderModel} ID: ${senderId} to ${receiverModel} ID: ${receiverId}`);
        const notification = await sendMessageService(senderId, senderModel, receiverId, receiverModel, message);
        console.log('Notification created:', notification);
        res.status(201).json({ notification });
    } catch (error) {
        console.error('Error sending message:', error.message);
        res.status(400).json({ message: error.message });
    }
};

export const getUserNotifications = async (req, res) => {
    try {
        const { receiverId } = req.params;
        console.log(`Fetching notifications for user/admin with ID: ${receiverId}`);
        const notifications = await getUserNotificationsService(receiverId);
        if (!notifications.length) {
            console.log(`No notifications found for user/admin with ID: ${receiverId}`);
            return res.status(404).json({ message: 'No notifications found' });
        }
        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(400).json({ message: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        console.log(`Marking notification as read with ID: ${notificationId}`);
        const notification = await markAsReadService(notificationId);
        if (!notification) {
            console.log(`Notification not found for ID: ${notificationId}`);
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json({ notification });
    } catch (error) {
        console.error('Error marking notification as read:', error.message);
        res.status(400).json({ message: error.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        console.log(`Deleting notification with ID: ${notificationId}`);
        const result = await deleteNotificationService(notificationId);
        if (!result) {
            console.log(`Notification not found for ID: ${notificationId}`);
            return res.status(404).json({ message: 'Notification not found' });
        }
        console.log('Notification deleted:', result);
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error.message);
        res.status(400).json({ message: error.message });
    }
};
