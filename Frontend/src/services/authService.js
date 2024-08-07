import axiosApiInstance from '../utils/axiosInstance';

export const login = async (email, password) => {
    try {
        const url = '/auth/login';
        console.log('Request URL:', axiosApiInstance.defaults.baseURL + url);
        const response = await axiosApiInstance.post(url, { email, password });
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};
