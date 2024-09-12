import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';

export const generatePrescription = async (data, adminToken) => {
    try {
        const url = API_PATH.prescriptions.generatePrescription;
        console.log('Generating prescription to URL:', url);
        console.log('Data content:', data);
        const response = await axiosApiInstance.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error generating prescription:', error.message);
        throw new Error(`Unable to generate prescription: ${error.message}`);
    }
};
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

export const repeatPrescriptionService = async (data, adminToken) => {
    try {
        const url = API_PATH.prescriptions.repeatPrescription;
        console.log('Repeating prescription to URL:', url);
        console.log('Data content:', data);
        const response = await axiosApiInstance.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error repeating prescription:', error.message);
        throw new Error(`Unable to repeat prescription: ${error.message}`);
    }
};

