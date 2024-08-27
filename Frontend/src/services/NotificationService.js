import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';

/**
 * 获取特定用户的通知。
 * @param {string} receiverId - 用户 ID。
 * @returns {Promise<Array>} - 返回通知数组的 Promise。
 * @throws {Error} - 请求失败时抛出错误。
 */
export const fetchUserNotifications = async (receiverId) => {
    try {
        const url = API_PATH.notification.getUserNotifications.replace(':receiverId', receiverId);
        console.log('Fetching user notifications from URL:', url);
        console.log('Fetching user notifications for receiver:', receiverId);
        const response = await axiosApiInstance.get(url);
        console.log('API Response:', response);
        // 假设返回的数据结构是 { notifications: [...] }
        return response.data;  // 根据你的后端返回的数据结构调整这行
    } catch (error) {
        console.error('Error fetching user notifications:', error.message);
        throw new Error(`Unable to fetch notifications: ${error.message}`);
    }
};

/**
 * 发送消息给特定用户。
 * @param {string} senderId - 发送者 ID。
 * @param {string} receiverId - 接收者 ID。
 * @param {string} message - 消息内容。
 * @returns {Promise<Object>} - 返回响应数据的 Promise。
 * @throws {Error} - 请求失败时抛出错误。
 */
export const sendUserMessage = async (senderId, receiverId, message) => {
    try {
        const url = API_PATH.notification.sendMessage;
        console.log('Sending user message to URL:', url);
        const response = await axiosApiInstance.post(url, { senderId, receiverId, message });
        return response.data;
    } catch (error) {
        console.error('Error sending user message:', error.message);
        throw new Error(`Unable to send message: ${error.message}`);
    }
};

/**
 * 将通知标记为已读。
 * @param {string} notificationId - 通知 ID。
 * @returns {Promise<Object>} - 返回响应数据的 Promise。
 * @throws {Error} - 请求失败时抛出错误。
 */
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

/**
 * 删除通知。
 * @param {string} notificationId - 通知 ID。
 * @returns {Promise<Object>} - 返回响应数据的 Promise。
 * @throws {Error} - 请求失败时抛出错误。
 */
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
