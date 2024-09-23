import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // 添加 useNavigate
import { Box, Typography, Container, CircularProgress, Button } from '@mui/material';
import { repeatPrescriptionService, getUserPrescriptions } from '../../services/PrescriptionService.js';
import { AdminContext } from '../../context/AdminContext.jsx';

const PrescriptionList = () => {
    const { userId } = useParams();
    const [prescriptions, setPrescriptions] = useState([]);
    const [patientName, setPatientName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { adminToken, adminId } = useContext(AdminContext);
    const navigate = useNavigate(); // 添加 navigate

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const data = await getUserPrescriptions(userId, adminToken);
                const sortedData = Array.isArray(data)
                    ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    : [];

                setPrescriptions(sortedData);
                if (sortedData.length > 0) {
                    setPatientName(sortedData[0].patientName || 'Unknown Patient');
                }
                setLoading(false);
            } catch (err) {
                setError('Error fetching prescriptions for user');
                setLoading(false);
            }
        };

        fetchPrescriptions();
    }, [userId, adminToken]);

    const handleBackToAdminPanel = () => {
        navigate('/admin/panel');
    };

    const sendRepeatPrescription = async (prescription) => {
        try {
            const data = {
                doctorId: adminId,
                userId: userId,
                prescriptionId: prescription._id,
            };
            await repeatPrescriptionService(data, adminToken);
            alert('Repeat prescription generated successfully!');
        } catch (error) {
            console.error('Error generating repeat prescription:', error);
            alert('Failed to generate repeat prescription.');
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>
                Prescriptions for {patientName}
            </Typography>
            {prescriptions.length > 0 ? (
                <>
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
                                <Button
                                    variant="contained"
                                    sx={{ marginTop: '10px', backgroundColor: '#007bff', color: '#fff' }}
                                    onClick={() => sendRepeatPrescription(prescription)}
                                >
                                    Send Repeat
                                </Button>
                            </Box>
                        ))}
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mt: 4,
                        }}
                    >
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: '#03035d',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#03035d',
                                },
                            }}
                            onClick={handleBackToAdminPanel}
                        >
                            Back to Admin Panel
                        </Button>
                    </Box>

                </>
            ) : (
                <Typography variant="body1" align="center">
                    No prescriptions found for this user.
                </Typography>
            )}
        </Container>
    );
};

export default PrescriptionList;
