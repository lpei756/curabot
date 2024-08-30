import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';

export const fetchUserNotifications = async (receiverId) => {
    try {
        const url = API_PATH.notification.getUserNotifications.replace(':receiverId', receiverId);
        console.log('Fetching user notifications from URL:', url);
        console.log('Fetching user notifications for receiver:', receiverId);
        const response = await axiosApiInstance.get(url);
        console.log('API Response:', response);
        return response.data;
    } catch (error) {
        console.error('Error fetching user notifications:', error.message);
        throw new Error(`Unable to fetch notifications: ${error.message}`);
    }
};

export const sendUserMessage = async ({senderId, receiverId, message, senderModel, receiverModel}) => {
    try {
        const url = API_PATH.notification.sendMessage;
        console.log('Sending user message to URL:', url);
        console.log('Request payload:', { senderId, receiverId, message, senderModel, receiverModel });
        const response = await axiosApiInstance.post(url, { senderId, receiverId, message, senderModel, receiverModel });
        return response.data;
    } catch (error) {
        console.error('Error sending user message:', error.message);
        throw new Error(`Unable to send message: ${error.message}`);
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        const url = API_PATH.notification.markAsRead.replace(':notificationId', notificationId);
        console.log('Marking notification as read from URL:', url);
        const response = await axiosApiInstance.put(url);
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read:', error.message);
        throw new Error(`Unable to mark notification as read: ${error.message}`);
    }
};

export const deleteNotification = async (notificationId) => {
    try {
        const url = API_PATH.notification.delete.replace(':notificationId', notificationId);
        console.log('Deleting notification from URL:', url);
        const response = await axiosApiInstance.delete(url);
        return response.data;
    } catch (error) {
        console.error('Error deleting notification:', error.message);
        throw new Error(`Unable to delete notification: ${error.message}`);
    }
};
