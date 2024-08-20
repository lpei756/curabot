import axiosApiInstance from '../utils/axiosInstance';
import { tokenStorage } from '../utils/localStorage';
import { API_PATH } from '../utils/urlRoutes';

console.log('Stored Admin Token:', tokenStorage.get('adminToken'));

export const adminLogin = async (email, password) => {
    try {
        const url = API_PATH.doctor.adminLogin;
        console.log('Request URL:', axiosApiInstance.defaults.baseURL + url);
        const response = await axiosApiInstance.post(url, { email, password });
        tokenStorage.save(response.data.token, 'adminToken'); // Save admin token with a different key
        return response.data;
    } catch (error) {
        console.error('Admin login error:', error);
        throw error;
    }
};

export const adminRegister = async (adminData) => {
    try {
        const url = API_PATH.admin.register;
        console.log('Request URL:', axiosApiInstance.defaults.baseURL + url);
        const response = await axiosApiInstance.post(url, adminData);
        return response.data;
    } catch (error) {
        console.error('Admin registration error:', error);
        throw error;
    }
};
