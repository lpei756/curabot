import { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, TextField, Button } from '@mui/material';
import { updateAdminData } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';

function EditAdmin({ adminData, setAdminData, adminId, setEditMode }) {
    const [updatedData, setUpdatedData] = useState({
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        email: adminData.email,
        role: adminData.role,
    });

    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`Field changed: ${name}, New value: ${value}`);
        setUpdatedData({ ...updatedData, [name]: value });
    };

    const handleUpdate = async () => {
        console.log('Updating admin with data:', updatedData);
        try {
            const data = await updateAdminData(adminId, updatedData);
            console.log('Update successful, returned data:', data);
            setAdminData(data);
            setEditMode(false);
            navigate('/superadmin/panel');
            window.location.reload();
        } catch (err) {
            console.error('Error during update:', err.message);
            setError(err.message);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h6" sx={{ color: '#03035d', marginBottom: '20px' }}>Edit Admin Information</Typography>
            {error && <Typography color="error">Error: {error}</Typography>}

            <TextField
                label="First Name"
                name="firstName"
                value={updatedData.firstName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Last Name"
                name="lastName"
                value={updatedData.lastName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Email"
                name="email"
                value={updatedData.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Role"
                name="role"
                value={updatedData.role}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                select
                SelectProps={{
                    native: true,
                }}
            >
                <option value="superadmin">Super Admin</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
            </TextField>
            <TextField
                label="Password"
                name="password"
                type="password"
                value={updatedData.password}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                helperText="Leave blank if you do not want to change the password"
            />

            <Button
                variant="contained"
                sx={{
                    backgroundColor: '#03035d',
                    color: '#fff',
                    margin: '10px 0'
                }}
                onClick={handleUpdate}
            >
                Update
            </Button>
            <Button
                variant="outlined"
                sx={{
                    borderColor: '#03035d',
                    color: '#03035d',
                    margin: '10px 0'
                }}
                onClick={() => setEditMode(false)}
            >
                Cancel
            </Button>
        </Box>
    );
}

EditAdmin.propTypes = {
    adminData: PropTypes.object.isRequired,
    setAdminData: PropTypes.func.isRequired,
    adminId: PropTypes.string.isRequired,
    setEditMode: PropTypes.func.isRequired,
};

export default EditAdmin;
