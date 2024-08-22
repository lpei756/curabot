import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';
import axios from 'axios';


export const sendChatMessage = async (message, authToken) => {
  try {
    const response = await axiosApiInstance.post(API_PATH.chat.send, 
      { message }, 
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    return response;
  } catch (error) {
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
