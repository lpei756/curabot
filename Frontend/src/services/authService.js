import axiosApiInstance from '../utils/axiosInstance';
import { tokenStorage } from '../utils/localStorage';
import { API_PATH } from '../utils/urlRoutes';

console.log('Stored Token:', tokenStorage.get());

export const login = async (email, password) => {
  try {
    const url = API_PATH.auth.login;
    console.log('Request URL:', axiosApiInstance.defaults.baseURL + url);
    const response = await axiosApiInstance.post(url, { email, password });
    tokenStorage.save(response.data.token);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
