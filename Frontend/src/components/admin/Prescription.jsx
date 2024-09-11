import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, TextField, Button } from '@mui/material';
import { generatePrescription } from '../../services/PrescriptionService.js';
import { fetchMe } from '../../services/AdminService';
import { AdminContext } from '../../context/AdminContext';

const Prescription = () => {
    const { adminId, adminToken } = useContext(AdminContext);
    const location = useLocation();
    const { patient } = location.state || {};
    const [prescriptionData, setPrescriptionData] = useState({
        doctorName: '',
        medications: '',
        instructions: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (patient && patient._id) {
            console.log("Received patient information:", patient);
        } else {
            console.error("Patient information is missing");
        }
    }, [patient]);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await fetchMe();
                const adminData = response.admin;
                setPrescriptionData((prevData) => ({
                    ...prevData,
                    doctorName: `${adminData.firstName} ${adminData.lastName}`,
                }));
                setIsLoading(false); // Data loaded
            } catch (error) {
                console.error('Error fetching admin data:', error);
                setIsLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPrescriptionData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!adminId) {
            setError('Admin ID is missing.');
            return;
        }

        if (prescriptionData.doctorName && prescriptionData.medications && prescriptionData.instructions) {
            const { doctorName, medications, instructions } = prescriptionData;
            const data = {
                doctorId: adminId,
                userId: patient._id,
                medications,
                instructions,
                doctorName,
            };

            try {
                await generatePrescription(data, adminToken);
                alert('Prescription saved and notification sent successfully!');
            } catch (error) {
                console.error('Error processing prescription or sending notification:', error);
                setError('Failed to save prescription or send notification. Please try again.');
            }
        } else {
            setError('Please fill in all fields');
        }
    };

    if (isLoading) {
        return <Typography variant="body1">Loading doctor information...</Typography>;
    }

    return (
        <Box sx={{ padding: 2 }}>
            {patient ? (
                <>
                    <Typography variant="h5" gutterBottom>
                        Prescription for {patient.firstName} {patient.lastName}
                    </Typography>

                    {error && (
                        <Typography variant="body2" color="error" gutterBottom>
                            {error}
                        </Typography>
                    )}

                    <TextField
                        label="Doctor Name"
                        name="doctorName"
                        value={prescriptionData.doctorName}
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
                </>
            ) : (
                <Typography variant="body2" color="error">
                    Patient information is missing.
                </Typography>
            )}
        </Box>
    );
};

export default Prescription;
