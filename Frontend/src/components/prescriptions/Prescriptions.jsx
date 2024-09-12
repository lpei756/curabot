import { useState, useEffect, useContext } from 'react';
import { Box, Typography, Container, CircularProgress, Button } from '@mui/material';
import { getAllPrescriptions } from '../../services/PrescriptionService.js';
import { sendUserMessage } from '../../services/NotificationService.js';
import { AuthContext } from '../../context/AuthContext';

const Prescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token, userId } = useContext(AuthContext);

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const data = await getAllPrescriptions(token);

                const sortedData = Array.isArray(data)
                    ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    : [];

                setPrescriptions(sortedData);
                setLoading(false);
            } catch (err) {
                setError('Error fetching prescriptions');
                setLoading(false);
            }
        };
        fetchPrescriptions();
    }, [token]);

    const handleRepeatPrescription = async (prescription) => {
        const message = "Can you please repeat this prescription for me?";
        const doctorId = prescription.doctor?._id;

        if (!doctorId) {
            console.error("Prescription doctor info:", prescription);
            setError("Doctor ID is missing for this prescription.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('senderId', userId);
            formData.append('receiverId', doctorId);
            formData.append('message', message);
            formData.append('senderModel', "User");
            formData.append('receiverModel', "Doctor");

            const response = await sendUserMessage(formData, token);
            console.log("Message sent successfully:", response);
        } catch (err) {
            console.error("Error sending repeat request:", err.message);
            setError(`Unable to send repeat request: ${err.message}`);
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>
                My Prescriptions
            </Typography>
            {prescriptions.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {prescriptions.map((prescription) => (
                        <Box
                            key={prescription._id}
                            sx={{
                                border: '1px solid #03035d',
                                borderRadius: '8px',
                                padding: '16px',
                                margin: '8px',
                                width: '100%',
                                maxWidth: '600px',
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>User:</Typography>
                                <Typography variant="body1">{prescription.patientName || 'Unknown Patient'}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Doctor:</Typography>
                                <Typography variant="body1">{prescription.doctorName || 'Unknown Doctor'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Medications:</Typography>
                                <Typography variant="body1">{prescription.medications}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Instructions:</Typography>
                                <Typography variant="body1">{prescription.instructions}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Date:</Typography>
                                <Typography variant="body1">{new Date(prescription.createdAt).toLocaleDateString()}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                    variant="contained"
                                    sx={{ backgroundColor: '#f0ad4e', color: '#fff' }}
                                    onClick={() => handleRepeatPrescription(prescription)}
                                >
                                    Repeat
                                </Button>
                            </Box>
                        </Box>
                    ))}
                </Box>
            ) : (
                <Typography variant="body1" align="center">
                    No prescriptions found.
                </Typography>
            )}
        </Container>
    );
};

export default Prescriptions;
