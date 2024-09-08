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

export const fetchTestResultById = async (testResultId) => {
    try {
        const url = API_PATH.testresult.get.replace(':testResultId', testResultId);
        const response = await axiosApiInstance.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching test result:', error);
        throw new Error('Failed to fetch test result');
    }
};

export const editTestResult = async (testResultId, updatedFields) => {
    try {
        const url = API_PATH.testresult.edit.replace(':testResultId', testResultId);
        const response = await axiosApiInstance.put(url, updatedFields);
        return response.data.testResult;
    } catch (error) {
        console.error('Error editing test result:', error);
        throw error;
    }
};

export const approveTestResult = async (testResultId) => {
    try {
        const url = API_PATH.testresult.approve.replace(':testResultId', testResultId);
        const response = await axiosApiInstance.post(url);
        return response.data.testResult;
    } catch (error) {
        console.error('Error approving test result:', error);
        throw error;
    }
};
