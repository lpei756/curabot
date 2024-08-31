import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';

export const fetchUserNotifications = async (receiverId) => {
    try {
        const url = API_PATH.notification.getUserNotifications.replace(':userId', receiverId);
        console.log('Fetching user notifications from URL:', url);
        const response = await axiosApiInstance.get(url);
        if (response.status === 200 && response.data.notifications) {
            return response.data.notifications;
        } else {
            console.warn('No notifications found or unexpected response format.');
            return [];
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn('No notifications found for the user:', receiverId);
            return [];
        } else {
            console.error('Error fetching user notifications:', error.message);
            throw new Error(`Unable to fetch user notifications: ${error.message}`);
        }
    }
};

export const fetchAdminNotifications = async (receiverId) => {
    console.log('fetchAdminNotifications called with receiverId:', receiverId);

    if (!receiverId) {
        console.error('No receiverId provided to fetchAdminNotifications');
        return [];
    }
    try {
        const url = API_PATH.notification.getAdminNotifications.replace(':adminId', receiverId);
        console.log('Generated URL for fetching admin notifications:', url);
        const response = await axiosApiInstance.get(url);
        console.log('Response received:', response);
        if (response.status === 200) {
            console.log('Response status is 200. Checking for notifications data...');
            if (response.data.notifications) {
                console.log('Notifications found:', response.data.notifications);
                return response.data.notifications;
            } else {
                console.warn('No notifications found in the response data.');
                return [];
            }
        } else {
            console.warn(`Unexpected response status: ${response.status}`);
            return [];
        }
    } catch (error) {
        console.error('An error occurred while fetching admin notifications:', error);
        if (error.response) {
            console.error('Error response:', error.response);
            if (error.response.status === 404) {
                console.warn('No notifications found for admin:', receiverId);
                return [];
            } else {
                console.error(`Unexpected error status: ${error.response.status}`);
            }
        }
        throw new Error(`Unable to fetch admin notifications: ${error.message}`);
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

export const sendDoctorMessage = async ({ senderId, receiverId, message, senderModel, receiverModel }) => {
    try {
        const url = API_PATH.notification.sendMessage;
        const payload = { senderId, receiverId, message, senderModel, receiverModel };
        console.log('Sending user message to URL:', url);
        console.log('Request payload:', payload);
        const response = await axiosApiInstance.post(url, payload);
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
