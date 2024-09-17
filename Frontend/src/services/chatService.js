import axiosApiInstance from '../utils/axiosInstance.js';
import { API_PATH } from '../utils/urlRoutes.js';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
export const sendChatMessage = async (message, authToken, userLocation, sessionId) => {
  try {
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

    const response = await axiosApiInstance.post(API_PATH.chat.send,
      { message, userLocation, sessionId },
      { headers }
    );
    return response;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error('Unauthorized');
    }
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export const sendFeedbackToServer = async (messageId, feedback) => {
  console.log('Sending feedback:', { messageId, feedback });

  try {
      const response = await axios.post('${apiUrl}/api/feedback', {
          messageId,
          feedback
      });
      console.log('Server response:', response.data);
      return response.data;
  } catch (error) {
      console.error('Error sending feedback:', error);
      throw new Error('Error sending feedback');
  }
};

export const fetchChatHistoryBySessionId = async (sessionId, authToken) => {
    try {
        const response = await axios.get(`${apiUrl}/api/chat/history/${sessionId}`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching chat history:', error);
        throw error;
    }
};

export const fetchUserChatHistories = async (userId, authToken) => {
  try {
    const response = await axios.get(`${apiUrl}/api/chat/user/${userId}/history`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data.chatSessions;
  } catch (error) {
    console.error('Error fetching chat histories:', error);

    throw error;
  }
};

export const fetchFeedbackData = async () => {
    try {
        const response = await axios.get(`${apiUrl}/api/feedback/summary`);
        return response.data;
    } catch (error) {
        console.error('Error fetching feedback data:', error);
        throw error;
    }
};
