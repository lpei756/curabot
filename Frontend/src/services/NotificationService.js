import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';

export const fetchUserNotifications = async (receiverId) => {
    console.log('fetchUserNotifications called with receiverId:', receiverId);
    if (!receiverId) {
        console.error('No receiverId provided to fetchUserNotifications');
        return [];
    }
    try {
        const url = API_PATH.notification.getUserNotifications.replace(':userId', receiverId);
        console.log('Generated URL for fetching user notifications:', url);
        const response = await axiosApiInstance.get(url);
        console.log('Response received:', response);
        if (response.status === 200) {
            console.log('Response status is 200. Checking for notifications data...');
            const notifications = response.data.notifications;
            if (Array.isArray(notifications)) {
                console.log('Notifications found:', notifications);
                return notifications;
            } else {
                console.warn('No valid notifications array found in the response data.');
                return [];
            }
        } else {
            console.warn(`Unexpected response status: ${response.status}`);
            return [];
        }
    } catch (error) {
        console.error('An error occurred while fetching user notifications:', error);
        throw new Error(`Unable to fetch user notifications: ${error.message}`);
    }
};
export const fetchAdminNotifications = async (receiverId) => {
    console.log('fetchAdminNotifications called with receiverId:', receiverId);
    if (!receiverId) {
        console.error('No receiverId provided to fetchUserNotifications');
        return [];
    }
    try {
        const url = API_PATH.notification.getAdminNotifications.replace(':adminId', receiverId);
        console.log('Generated URL for fetching admin notifications:', url);
        const response = await axiosApiInstance.get(url);
        console.log('Response received:', response);
        if (response.status === 200) {
            console.log('Response status is 200. Checking for notifications data...');
            const notifications = response.data.notifications;
            if (Array.isArray(notifications)) {
                console.log('Notifications found:', notifications);
                return notifications;
            } else {
                console.warn('No valid notifications array found in the response data.');
                return [];
            }
        } else {
            console.warn(`Unexpected response status: ${response.status}`);
            return [];
        }
    } catch (error) {
        console.error('An error occurred while fetching admin notifications:', error);
        throw new Error(`Unable to fetch admin notifications: ${error.message}`);
    }
};

export const sendUserMessage = async (formData, authToken) => {
    try {
        const url = API_PATH.notification.sendMessage;
        console.log('Sending user message to URL:', url);
        console.log('FormData content:', Object.fromEntries(formData.entries()));
        const response = await axiosApiInstance.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${authToken}`
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error sending user message:', error.message);
        throw new Error(`Unable to send message: ${error.message}`);
    }
};

export const sendDoctorMessage = async (formData, adminToken) => {
    try {
        const url = API_PATH.notification.sendMessage;
        console.log('Sending doctor message to URL:', url);
        console.log('FormData content:', Object.fromEntries(formData.entries()));
        const response = await axiosApiInstance.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${adminToken}`
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error sending doctor message:', error.message);
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
