import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';

export const createAppointment = async (appointmentData) => {
  try {
    const response = await axiosApiInstance.post(API_PATH.appointment.create, appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating appointment:', error.message);
    throw error;
  }
};

export const fetchUserAppointments = async () => {
    try {
      const response = await fetch(API_PATH.appointment.all, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust if needed
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
  
      const appointments = await response.json();
      return appointments;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  };

export const readAppointment = async (appointmentID) => {
    try {
      const url = API_PATH.appointment.read.replace(':appointmentID', appointmentID);
      const response = await axiosApiInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  };

  export const deleteAppointment = async (appointmentId) => {
    try {
      const url = `${API_PATH.appointment.delete.replace(':id', appointmentId)}`;
      console.log(`Sending DELETE request to URL: ${url}`);
  
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust if needed
        }
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
