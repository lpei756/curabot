import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';

export const fetchTestResults = async () => {
    try {
        const url = API_PATH.testresult.getAll;
        const response = await axiosApiInstance.get(url);
        return response.data.testResults || []
    } catch (error) {
        console.error('Error fetching test results:', error);
        throw error;
    }
};
