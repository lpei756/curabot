import axiosApiInstance from '../utils/axiosInstance';

export const sendChatMessage = async (message) => {
  try {
    const response = await axiosApiInstance.post('/chat', { message });
    return response;
  } catch (error) {
    console.error('Error sending chat message:', error.response?.data);
    throw new Error('Error sending chat message');
  }
};