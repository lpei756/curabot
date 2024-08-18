import { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, TextField, Button } from '@mui/material';
import { updateUserData } from '../../services/userService';
import { useNavigate } from 'react-router-dom';

function EditUser({ userData, setUserData, userId, setEditMode }) {
    const [updatedData, setUpdatedData] = useState({});
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedData({ ...updatedData, [name]: value });
    };

    const handleUpdate = async () => {
        try {
            const data = await updateUserData(userId, updatedData);
            setUserData(data);
            setEditMode(false);
            navigate(`/user`);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h6" sx={{ color: '#03035d', marginBottom: '20px' }}>Edit User Information</Typography>
            {error && <Typography color="error">Error: {error}</Typography>}
            <TextField
                label="First Name"
                name="firstName"
                defaultValue={userData.firstName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Middle Name"
                name="middleName"
                defaultValue={userData.middleName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Last Name"
                name="lastName"
                defaultValue={userData.lastName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Date of Birth"
                name="dateOfBirth"
                defaultValue={new Date(userData.dateOfBirth).toISOString().split('T')[0]}
                onChange={handleInputChange}
                type="date"
                fullWidth
                margin="normal"
            />
            <TextField
                label="Phone"
                name="phone"
                defaultValue={userData.phone}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Address"
                name="address"
                defaultValue={userData.address}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />

            <Typography variant="h6" sx={{ color: '#03035d', margin: '20px 0 10px 0' }}>Edit Emergency Contact</Typography>
            <TextField
                label="Emergency Contact Name"
                name="emergencyContactName"
                defaultValue={userData.emergencyContact.name}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Emergency Contact Phone"
                name="emergencyContactPhone"
                defaultValue={userData.emergencyContact.phone}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Emergency Contact Relationship"
                name="emergencyContactRelationship"
                defaultValue={userData.emergencyContact.relationship}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />

            <Typography variant="h6" sx={{ color: '#03035d', margin: '20px 0 10px 0' }}>Edit Insurance Information</Typography>
            <TextField
                label="Insurance Provider"
                name="insuranceProvider"
                defaultValue={userData.insurance.provider}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Policy Number"
                name="policyNumber"
                defaultValue={userData.insurance.policyNumber || 'N/A'}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
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

EditUser.propTypes = {
    userData: PropTypes.object.isRequired,
    setUserData: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    setEditMode: PropTypes.func.isRequired,
};

export default EditUser;
