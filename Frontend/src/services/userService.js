import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';

export const fetchUserData = async (userId) => {
  try {
    const response = await axiosApiInstance.get(API_PATH.auth.read.replace(':id', userId));
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user data:', error.message);
    throw error;
  }
};

export const updateUserData = async (userId, updatedData) => {
  try {
    const response = await axiosApiInstance.put(API_PATH.auth.update.replace(':id', userId), updatedData);
    return response.data.user;
  } catch (error) {
    console.error('Error updating user data:', error.message);
    throw error;
  }
};