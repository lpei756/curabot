import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Container, CircularProgress } from '@mui/material';
import { getUserPrescriptions } from '../../services/PrescriptionService.js';
import { AuthContext } from '../../context/AuthContext';

const PrescriptionList = () => {
    const { userId } = useParams();
    const [prescriptions, setPrescriptions] = useState([]);
    const [patientName, setPatientName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const data = await getUserPrescriptions(userId, token);
                console.log('Fetched prescriptions:', data);
                setPrescriptions(Array.isArray(data) ? data : []);
                if (Array.isArray(data) && data.length > 0) {
                    setPatientName(data[0].patientName || 'Unknown Patient');
                }
                setLoading(false);
            } catch (err) {
                setError('Error fetching prescriptions for user');
                setLoading(false);
            }
        };

        fetchPrescriptions();
    }, [userId, token]);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>
                Prescriptions for User: {patientName}
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
                        </Box>
                    ))}
                </Box>
            ) : (
                <Typography variant="body1" align="center">
                    No prescriptions found for this user.
                </Typography>
            )}
        </Container>
    );
};

export default PrescriptionList;
