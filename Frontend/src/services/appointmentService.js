import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';

function parseToken(token) {
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = atob(payloadBase64);
    const payload = JSON.parse(decodedPayload);

    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && currentTime > payload.exp) {
      console.log('Token Expire');
      return false;
    } else {
      console.log('Token Valid');
      return true;
    }
  } catch (e) {
    console.error('Error parsing token:', e);
    return false;
  }
}

export const createAppointment = async (appointmentData) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await axiosApiInstance.post(API_PATH.appointment.create, appointmentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const fetchUserAppointments = async () => {
  const token = localStorage.getItem('authToken');
  console.log('Token:', token);
  if (!parseToken(token)) {
    console.error('Invalid Token');
    alert('Your session has expired, please log in again.');
    return;
  }

  try {
    const response = await fetch(API_PATH.appointment.all, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch appointments');
    return await response.json();
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

export const readAppointment = async (appointmentID) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axiosApiInstance.get(API_PATH.appointment.read.replace(':id', appointmentID), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateAppointment = async (appointmentID, updatedData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axiosApiInstance.put(API_PATH.appointment.update.replace(':id', appointmentID), updatedData, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteAppointment = async (appointmentId) => {
  try {
    const url = API_PATH.appointment.delete.replace(':id', appointmentId);
    const token = localStorage.getItem('authToken');

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error('Failed to delete appointment:', errorMessage);
      throw new Error('Failed to delete appointment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

const handleError = (error) => {
  if (error.response) {
    console.error('Error response:', error.response.data);
    throw new Error(error.response.data.message || 'Error occurred');
  } else if (error.request) {
    console.error('Error request:', error.request);
    throw new Error('No response received from the server');
  } else {
    console.error('Error message:', error.message);
    throw new Error('Error setting up the request');
  }
};
