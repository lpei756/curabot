import axios from 'axios';

export const sendChatMessage = async (message, token) => {
    try {
        const response = await axios.post('http://localhost:3001/api/chat', { message }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response;
    } catch (error) {
        throw new Error('Error sending chat message');
    }
};
