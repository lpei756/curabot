import axiosApiInstance from '../utils/axiosInstance.js';
import { API_PATH } from '../utils/urlRoutes.js';
import axios from 'axios';

export const sendChatMessage = async (message, authToken, userLocation) => {
  try {
    const response = await axiosApiInstance.post(API_PATH.chat.send, 
      { message, userLocation }, 
      { headers: { Authorization: `Bearer ${authToken}` } }
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
      const response = await axios.post('http://localhost:3001/api/feedback', {
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
