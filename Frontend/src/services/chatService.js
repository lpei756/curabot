import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';

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
