import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';

export const getAllPrescriptions = async (token) => {
    try {
        const response = await axiosApiInstance.get(API_PATH.prescriptions.getAll, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data && response.data.length > 0) {
            return response.data;
        } else {
            return 'No prescriptions available';
        }
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        throw error;
    }
};

export const getUserPrescriptions = async (userId, token) => {
    try {
        const url = API_PATH.prescriptions.getUserPrescriptions.replace(':userId', userId);
        const response = await axiosApiInstance.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (response.data && response.data.length > 0) {
            return response.data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching user prescriptions:', error);
        throw error;
    }
};
