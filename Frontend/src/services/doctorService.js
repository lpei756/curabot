import axiosApiInstance from '../utils/axiosInstance.js';
import { API_PATH } from '../utils/urlRoutes.js';

export const getDoctorsByClinic = async (clinicId) => {
    try {
        const response = await axiosApiInstance.get(API_PATH.doctor.byclinic(clinicId));
        return response.data;
    } catch (error) {
        console.error('Error fetching doctors:', error);
        throw error;
    }
};

export const getDoctorById = async (doctorId) => {
    try {
        if (doctorId === "Not assigned" || doctorId === null || doctorId === undefined) {
            return { firstName: "Not", lastName: "assigned" };
        }

        const response = await axiosApiInstance.get(API_PATH.doctor.read.replace(':doctorID', doctorId));
        return response.data;
    } catch (error) {
        console.error('Error fetching doctor:', error);
        throw error;
    }
};
