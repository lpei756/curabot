import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';

export const createAppointment = async (appointmentData) => {
  try {
    const response = await axiosApiInstance.post(API_PATH.appointment.create, appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating appointment:', error.message);
    throw error;
  }
};
