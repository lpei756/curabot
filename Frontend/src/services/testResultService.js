import axiosApiInstance from '../utils/axiosInstance';
import { API_PATH } from '../utils/urlRoutes';

export const fetchTestResults = async () => {
    try {
        const url = API_PATH.testresult.getAll;
        const response = await axiosApiInstance.get(url);
        if (response.data.length === 0) {
            return { noResults: true }; // Special case for no results
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching test results:', error);
        throw error; // Re-throw the error for handling in the component
    }
};