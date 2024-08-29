import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';

export const fetchUserData = async (userId) => {
  try {
    const url = API_PATH.auth.read.replace(':id', userId);
    console.log('Request URL:', url);
    const response = await axiosApiInstance.get(url);
    console.log('API Response:', response);
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user data:', error.message);
    throw error;
  }
};

export const updateUserData = async (userId, updatedData) => {
  try {
    const url = API_PATH.auth.update.replace(':id', userId);
    console.log('Request URL:', url);
    console.log('Updated data being sent:', updatedData);
    const response = await axiosApiInstance.put(url, updatedData);
    console.log('Response from server:', response.data);
    return response.data.user;
  } catch (error) {
    console.error('Error updating user data:', error.message);
    throw error;
  }
};
