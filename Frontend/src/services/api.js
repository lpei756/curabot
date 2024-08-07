import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

const uploadImage = async (userId, imageUrl) => {
    try {
        const response = await axios.post('http://localhost:3001/api/images/uploadImage', { userId, imageUrl });
        console.log('Image uploaded:', response.data);
    } catch (error) {
        console.error('Error uploading image:', error);
    }
};

uploadImage('user-id-here', 'https://example.com/image.jpg');
