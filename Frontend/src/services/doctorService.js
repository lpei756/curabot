import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';

export const getDoctorsByClinic = async (clinicId) => {
  try {
    const response = await fetch(API_PATH.doctor.byclinic(clinicId));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching doctors:', errorText);
      throw new Error('Failed to fetch doctors');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching doctors:', error.message);
    throw error;
  }
};

export const getDoctorById = async (doctorId) => {
  try {
    const response = await axiosApiInstance.get(API_PATH.doctor.read.replace(':doctorID', doctorId));
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor:', error);
    throw error;
  }
};