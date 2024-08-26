import { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, TextField, Button } from '@mui/material';
import { updatePatientData } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';

function EditPatients({ patientData, setPatientData, patientId, setEditMode }) {
    const [updatedData, setUpdatedData] = useState({});
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedData({ ...updatedData, [name]: value });
    };

    const handleUpdate = async () => {
        try {
            const data = await updatePatientData(patientId, updatedData);
            setPatientData(data);
            setEditMode(false);
            navigate('/admin');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h6" sx={{ color: '#03035d', marginBottom: '20px' }}>Edit Patient Information</Typography>
            {error && <Typography color="error">Error: {error}</Typography>}
            <TextField
                label="First Name"
                name="firstName"
                defaultValue={patientData.firstName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Last Name"
                name="lastName"
                defaultValue={patientData.lastName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Email"
                name="email"
                defaultValue={patientData.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Phone"
                name="phone"
                defaultValue={patientData.phone}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Address"
                name="address"
                defaultValue={patientData.address}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />

            <Typography variant="h6" sx={{ color: '#03035d', margin: '20px 0 10px 0' }}>Edit Emergency Contact</Typography>
            <TextField
                label="Emergency Contact Name"
                name="emergencyContactName"
                defaultValue={patientData.emergencyContact.name}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Emergency Contact Phone"
                name="emergencyContactPhone"
                defaultValue={patientData.emergencyContact.phone}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Emergency Contact Relationship"
                name="emergencyContactRelationship"
                defaultValue={patientData.emergencyContact.relationship}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />

            <Typography variant="h6" sx={{ color: '#03035d', margin: '20px 0 10px 0' }}>Edit Insurance Information</Typography>
            <TextField
                label="Insurance Provider"
                name="insuranceProvider"
                defaultValue={patientData.insurance.provider}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Policy Number"
                name="policyNumber"
                defaultValue={patientData.insurance.policyNumber || 'N/A'}
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

EditPatients.propTypes = {
    patientData: PropTypes.object.isRequired,
    setPatientData: PropTypes.func.isRequired,
    patientId: PropTypes.string.isRequired,
    setEditMode: PropTypes.func.isRequired,
};

export default EditPatients;
