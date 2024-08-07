// services/appointmentService.js

import axios from 'axios';

// Replace with actual token management logic
const yourAuthToken = 'your-auth-token'; 

export const getAppointmentById = async (appointmentId) => {
    const response = await axios.get(`http://localhost:3001/api/appointments/${appointmentId}`, {
        headers: {
            'Authorization': `Bearer ${yourAuthToken}`,
        },
    });
    return response.data;
};

export const createAppointment = async (appointmentData) => {
    const response = await axios.post(`http://localhost:3001/api/appointments/create`, appointmentData, {
        headers: {
            'Authorization': `Bearer ${yourAuthToken}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

export const updateAppointment = async (appointmentId, appointmentData) => {
    const response = await axios.put(`http://localhost:3001/api/appointments/${appointmentId}`, appointmentData, {
        headers: {
            'Authorization': `Bearer ${yourAuthToken}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};