import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import PropTypes from 'prop-types';
import { sendDoctorMessage } from '../../services/NotificationService';

const Prescription = ({ patient, onSubmit, doctorFirstName, doctorLastName, adminId }) => {
    const [prescriptionData, setPrescriptionData] = useState({
        doctorName: '',
        medications: '',
        instructions: '',
    });

    useEffect(() => {
        if (doctorFirstName && doctorLastName) {
            setPrescriptionData((prevData) => ({
                ...prevData,
                doctorName: `${doctorFirstName} ${doctorLastName}`,
            }));
        }
    }, [doctorFirstName, doctorLastName]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPrescriptionData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        if (prescriptionData.doctorName && prescriptionData.medications) {
            onSubmit(prescriptionData);

            const formData = new FormData();
            formData.append('message', `Prescription created by Dr. ${prescriptionData.doctorName}: Medications - ${prescriptionData.medications}`);
            formData.append('senderId', adminId);
            formData.append('senderModel', 'Admin');
            formData.append('receiverId', patient._id);
            formData.append('receiverModel', 'User');

            try {
                await sendDoctorMessage(formData);
                alert("Prescription sent to patient!");
            } catch (error) {
                console.error("Error sending prescription notification:", error);
            }
        } else {
            alert('Please fill in all fields');
        }
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h5" gutterBottom>
                Prescription for {patient.firstName} {patient.lastName}
            </Typography>
            <TextField
                label="Doctor Name"
                name="doctorName"
                value={prescriptionData.doctorName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                disabled
            />
            <TextField
                label="Medications"
                name="medications"
                value={prescriptionData.medications}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={4}
            />
            <TextField
                label="Instructions"
                name="instructions"
                value={prescriptionData.instructions}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
            />
            <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{ backgroundColor: '#03035d', marginTop: 2 }}
            >
                Submit Prescription
            </Button>
        </Box>
    );
};

Prescription.propTypes = {
    patient: PropTypes.shape({
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
        _id: PropTypes.string.isRequired,
    }).isRequired,
    onSubmit: PropTypes.func.isRequired,
    doctorFirstName: PropTypes.string.isRequired,
    doctorLastName: PropTypes.string.isRequired,
    adminId: PropTypes.string.isRequired,
};

export default Prescription;
