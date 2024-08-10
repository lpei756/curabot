import axios from 'axios';
import { tokenStorage, userDataStorage } from './localStorage';

const axiosApiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

axiosApiInstance.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosApiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      tokenStorage.remove();
      userDataStorage.remove();
    }
    return Promise.reject(error);
  }
);

export default axiosApiInstance;
