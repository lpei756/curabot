import axios from 'axios';

export const fetchFeedbackData = async () => {
    try {
        const response = await axios.get('http://localhost:3001/api/feedback/summary');
        return response.data;
    } catch (error) {
        console.error('Error fetching feedback data:', error);
        throw error;
    }
};