import { useState, useEffect } from 'react';
import axiosApiInstance from '../../utils/axiosInstance';
import { API_PATH } from '../../utils/urlRoutes';
import { Box, TextField, Button, Typography } from '@mui/material';

function UpdateUser({ userId, onSuccess }) {
    const [userData, setUserData] = useState({ name: '', email: '' });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosApiInstance.get(API_PATH.auth.read.replace(':id', userId));
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleUpdate = async () => {
        try {
            const response = await axiosApiInstance.put(API_PATH.auth.update.replace(':id', userId), userData);
            setUserData(response.data);
            onSuccess();
        } catch (error) {
            setError('Update failed: ' + error.message);
        }
    };

    return (
        <Box>
            <Typography variant="h6">Update User Information</Typography>
            <TextField
                margin="normal"
                label="Name"
                fullWidth
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                placeholder="Name"
            />
            <TextField
                margin="normal"
                label="Email"
                fullWidth
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                placeholder="Email"
            />
            {error && <Typography color="error">{error}</Typography>}
            <Button variant="contained" color="primary" onClick={handleUpdate}>
                Update
            </Button>
        </Box>
    );
}

export default UpdateUser;
