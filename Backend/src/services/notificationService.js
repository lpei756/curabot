import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

export const getUserNotifications = async (userId) => {
    try {
        console.log('Fetching notifications for receiver with ID:', userId);
        let notifications = await Notification.find({ receiver: userId }).sort({ date: -1 });
        if (!Array.isArray(notifications)) {
            notifications = [];
        }
        console.log(`Notifications fetched successfully, found ${notifications.length} notifications.`);
        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        throw error;
    }
};


export const getAdminNotifications = async (adminId) => {
    try {
        console.log('Fetching notifications for receiver with ID:', adminId);
        let notifications = await Notification.find({ receiver: adminId }).sort({ date: -1 });
        if (!Array.isArray(notifications)) {
            notifications = [];
        }
        console.log(`Notifications fetched successfully, found ${notifications.length} notifications.`);
        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        throw error;
    }
};

const getUserOrAdmin = async (id, model) => {
    return model === 'User' ? await User.findById(id) : await Admin.findById(id);
};

export const sendMessage = async (senderId, senderModel, receiverId, receiverModel, message) => {
    try {
        console.log(`Sending message from ${senderModel} with ID: ${senderId} to ${receiverModel} with ID: ${receiverId}`);

        const sender = await getUserOrAdmin(senderId, senderModel);
        const receiver = await getUserOrAdmin(receiverId, receiverModel);

        if (!sender || !receiver) {
            const missingModel = !sender ? senderModel : receiverModel;
            const missingId = !sender ? senderId : receiverId;
            console.error(`${missingModel} not found with ID: ${missingId}`);
            throw new Error(`${missingModel} not found`);
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
