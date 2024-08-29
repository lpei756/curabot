import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

export const sendMessage = async (senderId, senderModel, receiverId, receiverModel, message) => {
    try {
        console.log(`Sending message from ${senderModel} with ID: ${senderId} to ${receiverModel} with ID: ${receiverId}`);

        const sender = senderModel === 'User' ? await User.findById(senderId) : await Admin.findById(senderId);
        const receiver = receiverModel === 'User' ? await User.findById(receiverId) : await Admin.findById(receiverId);

        if (!sender) {
            console.error(`${senderModel} not found with ID: ${senderId}`);
            throw new Error(`${senderModel} not found`);
        }

        if (!receiver) {
            console.error(`${receiverModel} not found with ID: ${receiverId}`);
            throw new Error(`${receiverModel} not found`);
        }

        const senderName = `${sender.firstName} ${sender.lastName}`;
        const receiverName = `${receiver.firstName} ${receiver.lastName}`;

        const notification = new Notification({
            sender: senderId,
            senderModel,
            senderName,
            receiver: receiverId,
            receiverModel,
            receiverName,
            message,
            isRead: false,
            date: new Date(),
            notificationType: 'info',
        });

        console.log('Saving notification:', notification);
        await notification.save();

        console.log('Notification saved successfully:', notification);
        return notification;
    } catch (error) {
        console.error('Error sending message:', error.message);
        throw error;
    }
};

export const getUserNotifications = async (receiverId) => {
    try {
        console.log('Fetching notifications for receiver with ID:', receiverId);

        const notifications = await Notification.find({ receiver: receiverId }).sort({ date: -1 });
        if (!notifications.length) {
            console.log('No notifications found for receiver with ID:', receiverId);
            return [];
        }

        console.log('Notifications fetched successfully!');
        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        throw error;
    }
};

export const markAsRead = async (notificationId) => {
    try {
        console.log('Marking notification as read with ID:', notificationId);

        const notification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
        if (!notification) {
            console.error('Notification not found with ID:', notificationId);
            throw new Error('Notification not found');
        }

        console.log('Notification marked as read:', notification);
        return notification;
    } catch (error) {
        console.error('Error marking notification as read:', error.message);
        throw error;
    }
};

export const deleteNotification = async (notificationId) => {
    try {
        console.log('Deleting notification with ID:', notificationId);

        const notification = await Notification.findByIdAndDelete(notificationId);
        if (!notification) {
            console.error('Notification not found with ID:', notificationId);
            throw new Error('Notification not found');
        }

        console.log('Notification deleted successfully:', notification);
        return notification;
    } catch (error) {
        console.error('Error deleting notification:', error.message);
        throw error;
    }
};
