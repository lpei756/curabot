import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';

export const getClinics = async () => {
  try {
    const response = await axiosApiInstance.get(API_PATH.clinic.all);
    return response.data;
  } catch (error) {
    console.error('Error fetching clinics:', error);
    throw error;
  }
};
