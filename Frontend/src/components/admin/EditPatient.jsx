import { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, TextField, Button } from '@mui/material';
import { updatePatientData } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';

function EditPatient({ patientData, setPatientData, patientId, setEditMode, returnPath }) {
    const [updatedData, setUpdatedData] = useState({
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        email: patientData.email,
        phone: patientData.phone,
        address: patientData.address,
        emergencyContact: {
            name: patientData.emergencyContact.name,
            phone: patientData.emergencyContact.phone,
            relationship: patientData.emergencyContact.relationship
        },
        medicalHistory: {
            chronicDiseases: patientData.medicalHistory.chronicDiseases,
            pastSurgeries: patientData.medicalHistory.pastSurgeries,
            familyMedicalHistory: patientData.medicalHistory.familyMedicalHistory,
            medicationList: patientData.medicalHistory.medicationList,
            allergies: patientData.medicalHistory.allergies
        },
        insurance: {
            provider: patientData.insurance.provider,
            policyNumber: patientData.insurance.policyNumber,
            coverageDetails: patientData.insurance.coverageDetails
        }
    });

    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`Field changed: ${name}, New value: ${value}`);
        setUpdatedData({ ...updatedData, [name]: value });
    };

    const handleUpdate = async () => {
        const cleanedData = { ...updatedData };
        if (!cleanedData.insurance.policyNumber) {
            delete cleanedData.insurance.policyNumber;
        }
        console.log('Updating patient with data:', updatedData);
        try {
            const data = await updatePatientData(patientId, updatedData);
            console.log('Update successful, returned data:', data);
            setPatientData(data);
            setEditMode(false);
            navigate(returnPath);
            window.location.reload();
        } catch (err) {
            console.error('Error during update:', err.message);
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
                label="Phone"
                name="phone"
                value={updatedData.phone}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Address"
                name="address"
                value={updatedData.address}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />

            <Typography variant="h6" sx={{ color: '#03035d', margin: '20px 0 10px 0' }}>Edit Emergency Contact</Typography>
            <TextField
                label="Emergency Contact Name"
                name="emergencyContactName"
                value={updatedData.emergencyContact.name}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Emergency Contact Phone"
                name="emergencyContactPhone"
                value={updatedData.emergencyContact.phone}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Emergency Contact Relationship"
                name="emergencyContactRelationship"
                value={updatedData.emergencyContact.relationship}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />

            <Typography variant="h6" sx={{ color: '#03035d', margin: '20px 0 10px 0' }}>Edit Insurance Information</Typography>
            <TextField
                label="Insurance Provider"
                name="insuranceProvider"
                value={updatedData.insurance.provider}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Policy Number"
                name="policyNumber"
                value={updatedData.insurance.policyNumber}
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

EditPatient.propTypes = {
    returnPath: PropTypes.string.isRequired,
    patientData: PropTypes.object.isRequired,
    setPatientData: PropTypes.func.isRequired,
    patientId: PropTypes.string.isRequired,
    setEditMode: PropTypes.func.isRequired,
};

export default EditPatient;
