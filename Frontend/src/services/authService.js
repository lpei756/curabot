import axiosApiInstance from '../utils/axiosInstance';
import { tokenStorage } from '../utils/localStorage';
import { API_PATH } from '../utils/urlRoutes';

console.log('Stored Token:', tokenStorage.get());

export const login = async (email, password) => {
  try {
    const url = API_PATH.auth.login;
    console.log('Request URL:', url);
    const response = await axiosApiInstance.post(url, { email, password });
    tokenStorage.save(response.data.token);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const url = API_PATH.auth.register;
    console.log('Request URL:', url);
    const response = await axiosApiInstance.post(url, userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const sendVerificationCode = async (email) => {
  try {
      const response = await axiosApiInstance.post(API_PATH.auth.sendCode, { email });
      return response.data;
  } catch (error) {
      console.error('Error sending verification code:', error);
      throw error;
  }
};
