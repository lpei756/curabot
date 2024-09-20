import axiosApiInstance from '../utils/axiosInstance.js';
import { tokenStorage } from '../utils/localStorage.js';
import { API_PATH } from '../utils/urlRoutes.js';

export const adminLogin = async (email, password) => {
    try {
        const url = API_PATH.admin.login;
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
        const response = await axiosApiInstance.post(url, adminData);
        return response.data;
    } catch (error) {
        console.error('Admin registration error:', error);
        throw error;
    }
};

export const updateAdminData = async (adminId, updateData) => {
    try {
        const url = API_PATH.admin.update.replace(':id', adminId);
        const response = await axiosApiInstance.put(url, updateData);
        return response.data;
    } catch (error) {
        console.error('Admin update error:', error);
        throw error;
    }
};

export const deleteAdmin = async (adminId) => {
    try {
        const url = API_PATH.admin.delete.replace(':id', adminId);
        const response = await axiosApiInstance.delete(url);
        return response.data;
    } catch (error) {
        console.error('Admin update error:', error);
        throw error;
    }
};

export const fetchAllAdminIDs = async () => {
    try {
        const url = API_PATH.admin.getAllAdmins;
        const response = await axiosApiInstance.get(url);
        return response.data.admins;
    } catch (error) {
        console.error('Error fetching all admin IDs:', error.message);
        throw error;
    }
};

export const fetchAllPatients = async () => {
    try {
        const url = API_PATH.admin.getAllPatients;
        const response = await axiosApiInstance.get(url);
        return response.data.patients;
    } catch (error) {
        console.error('Error fetching all patients:', error.message);
        throw error;
    }
};

export const fetchPatientData = async (patientId) => {
    try {
        const url = API_PATH.admin.readPatient.replace(':id', patientId);
        const response = await axiosApiInstance.get(url);
        const patientData = response.data.user;
        return patientData;
    } catch (error) {
        console.error('Patient read error:', error);
        throw error;
    }
};

export const fetchPatientbyID = async (patientID) => {
    try {
        const url = API_PATH.admin.getbyPatientID.replace(':patientID', patientID);
        const response = await axiosApiInstance.get(url);
        const patientData = response.data;
        return patientData;
    } catch (error) {
        console.error('Patient read error:', error);
        throw error;
    }
};

export const fetchAdminData = async (adminId) => {
    try {
        const url = API_PATH.admin.read.replace(':id', adminId);
        const response = await axiosApiInstance.get(url);
        const adminData = response.data.admin;
        return adminData;
    } catch (error) {
        console.error('Patient read error:', error);
        throw error;
    }
};

export const updatePatientData = async (patientId, updatedData) => {
    try {
        const url = API_PATH.admin.updatePatient.replace(':id', patientId);
        const response = await axiosApiInstance.put(url, updatedData);
        return response.data.patient;
    } catch (error) {
        console.error('Error updating patient data:', error.message);
        throw error;
    }
};

export const fetchDoctors = async () => {
    try {
        const url = API_PATH.admin.getDoctors;
        const response = await axiosApiInstance.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching doctors:', error.message);
        throw error;
    }
};

export const fetchMe = async () => {
    try {
        const url = API_PATH.admin.me;
        const token = tokenStorage.get();
        if (!token) {
            throw new Error('Admin token not found.');
        }
        const response = await axiosApiInstance.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching current admin details:', error.message);
        throw error;
    }
};
