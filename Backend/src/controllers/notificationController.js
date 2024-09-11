import {
    sendMessage as sendMessageService,
    getNotifications as getNotificationsService,
    markAsRead as markAsReadService,
    deleteNotification as deleteNotificationService,
} from '../services/notificationService.js';
import Admin from '../models/Admin.js';
import Doctor from '../models/Doctor.js';


export const sendMessage = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);
        const { senderId, senderModel, receiverId, receiverModel, message, notificationType } = req.body;
        if (!senderId || !senderModel || !receiverId || !receiverModel || !message) {
            return res.status(400).json({
                status: "failed",
                error: "Invalid request. Please review request and try again.",
                fields: {
                    senderId: senderId ? undefined : "senderId is required",
                    senderModel: senderModel ? undefined : "senderModel is required",
                    receiverModel: receiverModel ? undefined : "receiverModel is required",
                    receiverId: receiverId ? undefined : "receiverId is required",
                    message: message ? undefined : "message is required"
                }
            });
        }
        let pdfFilePath = null;
        if (req.file && req.file.filename) {
            pdfFilePath = `/uploads/${req.file.filename}`;
        }
        const notification = await sendMessageService({
            senderId,
            senderModel,
            receiverId,
            receiverModel,
            message,
            notificationType,
            pdfFilePath
        });
        console.log('Notification saved successfully:', notification);
        res.status(201).json({ notification });
    } catch (error) {
        console.error('Error sending message:', error.message);
        res.status(500).json({ error: error.message });
    }
};

export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const { receiverModel } = req.query;
        console.log(`Fetching notifications for ${receiverModel} with ID: ${userId}`);
        const notifications = await getNotificationsService(userId, receiverModel || 'User');
        console.log(`Notifications found: ${notifications.length} for ${receiverModel} with ID: ${userId}`);
        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(400).json({ message: error.message });
    }
};

export const getAdminNotifications = async (req, res) => {
    try {
        const { adminId } = req.params;
        const { receiverModel } = req.query;

        let actualId = adminId;
        if (receiverModel === 'Doctor') {
            const admin = await Admin.findOne({ _id: adminId, role: 'doctor' });
            if (admin) {
                actualId = admin._id;
            } else {
                const doctor = await Doctor.findById(adminId);
                if (!doctor) {
                    return res.status(404).json({ message: "Doctor not found" });
                }
                actualId = doctor._id;
            }
        }
        const notifications = await getNotificationsService(actualId, receiverModel || 'Doctor');
        console.log(`Notifications found: ${notifications.length} for ${receiverModel} with ID: ${actualId}`);
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
