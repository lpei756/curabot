import axiosApiInstance from '../utils/axiosInstance';

export const sendChatMessage = async (message, authToken) => {
  try {
    const response = await axiosApiInstance.post('/api/chat', { message }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return response;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};
