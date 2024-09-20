import axiosApiInstance from '../utils/axiosInstance.js';
import { API_PATH } from '../utils/urlRoutes.js';

export const fetchUserData = async (userId) => {
  try {
    const url = API_PATH.auth.read.replace(':id', userId);
    const response = await axiosApiInstance.get(url);
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user data:', error.message);
    throw error;
  }
};

export const updateUserData = async (userId, updatedData) => {
  try {
    const url = API_PATH.auth.update.replace(':id', userId);
    const response = await axiosApiInstance.put(url, updatedData);
    return response.data.user;
  } catch (error) {
    console.error('Error updating user data:', error.message);
    throw error;
  }
};
