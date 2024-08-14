import axios from 'axios';

export const getClinics = async () => {
    const response = await axios.get('http://localhost:3001/api/clinics');
    return response.data;
};
