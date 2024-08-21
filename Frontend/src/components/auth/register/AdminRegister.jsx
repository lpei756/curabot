import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import PropTypes from 'prop-types';
import { adminRegister } from '../../../services/AdminService';

const AdminRegister = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: '',
    });

    const [error, setError] = useState(null);
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        const nameParts = name.split('.');
        if (nameParts.length > 1) {
            setFormData((prevData) => ({
                ...prevData,
                [nameParts[0]]: {
                    ...prevData[nameParts[0]],
                    [nameParts[1]]: value,
                },
            }));
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }

        if (name === 'password') {
            if (value.length < 6) {
                setPasswordError('Password must be at least 6 characters long.');
            } else {
                setPasswordError('');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwordError) {
            return;
        }

        try {
            const data = await adminRegister(formData);
            console.log('Registered admin:', data.admin.firstName, data.admin.lastName, data.admin.email);
            navigate('/');
            if (onSuccess) {
                onSuccess(data.admin);
            }
        } catch (err) {
            console.error('Error during admin registration:', err);
            setError('Registration failed. Please use another email address.');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '600px', mx: 'auto', mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom style={{ color: 'black', textAlign: 'center' }}>Admin Register</Typography>

            {error && (
                <Typography variant="body2" color="error" gutterBottom>
                    {error}
                </Typography>
            )}

            <TextField
                label="First Name"
                variant="standard"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Last Name"
                variant="standard"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Email"
                variant="standard"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                error={!!passwordError}
                helperText={passwordError}
            />
            <TextField
                label="Password"
                variant="standard"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                error={!!passwordError}
                helperText={passwordError}
            />
            <FormControl variant="standard" fullWidth margin="normal" required>
                <InputLabel>Role</InputLabel>
                <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Role"
                >
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="nurse">Nurse</MenuItem>
                </Select>
            </FormControl>

            <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }} style={{
                backgroundColor: '#03035d',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            }}>
                Register
            </Button>
        </Box>
    );
};

AdminRegister.propTypes = {
    onSuccess: PropTypes.func,
};

export default AdminRegister;
