import axiosApiInstance from '../utils/axiosInstance';
import { tokenStorage } from '../utils/localStorage';
import { API_PATH } from '../utils/urlRoutes';

console.log('Stored Admin Token:', tokenStorage.get());

export const adminLogin = async (email, password) => {
    try {
        const url = API_PATH.admin.login;
        console.log('Request URL:', axiosApiInstance.defaults.baseURL + url);
        const response = await axiosApiInstance.post(url, { email, password });

        tokenStorage.save(response.data.token);
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

export const adminRead = async (id) => {
    try {
        const url = API_PATH.admin.read.replace(':id', id);
        console.log('Request URL:', axiosApiInstance.defaults.baseURL + url);
        const response = await axiosApiInstance.get(url);
        return response.data;
    } catch (error) {
        console.error('Admin read error:', error);
        throw error;
    }
};

export const adminUpdate = async (id, updateData) => {
    try {
        const url = API_PATH.admin.update.replace(':id', id);
        console.log('Request URL:', axiosApiInstance.defaults.baseURL + url);
        const response = await axiosApiInstance.put(url, updateData);
        return response.data;
    } catch (error) {
        console.error('Admin update error:', error);
        throw error;
    }
};

export const adminLogout = async () => {
    try {
        const url = API_PATH.admin.logout;
        console.log('Request URL:', axiosApiInstance.defaults.baseURL + url);
        const response = await axiosApiInstance.post(url);
        tokenStorage.remove('adminToken'); // Remove the admin token after logout
        return response.data;
    } catch (error) {
        console.error('Admin logout error:', error);
        throw error;
    }
};

export const getAllAdmins = async () => {
    try {
        const url = API_PATH.admin.getAllAdmins;
        console.log('Request URL:', axiosApiInstance.defaults.baseURL + url);
        const response = await axiosApiInstance.get(url);
        return response.data;
    } catch (error) {
        console.error('Get all admins error:', error);
        throw error;
    }
};

export const getAllPatients = async () => {
    try {
        const url = API_PATH.admin.getAllPatients;
        console.log('Request URL:', axiosApiInstance.defaults.baseURL + url);
        const response = await axiosApiInstance.get(url);
        return response.data;
    } catch (error) {
        console.error('Get all patients error:', error);
        throw error;
    }
};
