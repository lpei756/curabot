import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, Collapse, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ImageDisplay from '../image/ImageDisplay';
import Lottie from 'lottie-react';
import animationData from '../../assets/loading.json';
import { fetchPatientData } from '../../services/adminService';

function ReadPatient({ returnPath }) {
    const { patientId } = useParams();
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedBlock, setExpandedBlock] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Patient ID from useParams:", patientId);

        if (!patientId) {
            setError("Patient ID is undefined");
            setLoading(false);
            return;
        }

        const loadPatientData = async () => {
            try {
                const response = await fetchPatientData(patientId);
                console.log("API response:", response);

                if (response) {
                    console.log("User data found:", response);
                    setPatientData(response);
                } else {
                    setError("User data is undefined or not returned from the API.");
                }
            } catch (err) {
                console.error("Error fetching patient data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadPatientData();
    }, [patientId]);

    const toggleBlock = (block) => {
        setExpandedBlock(expandedBlock === block ? null : block);
    };

    const handleBackToAdminPanel = () => {
        navigate(returnPath);
    };

    if (loading) return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            <Lottie
                animationData={animationData}
                style={{
                    width: '200px',
                    height: '200px',
                    zIndex: 1,
                    pointerEvents: 'none',
                }}
            />
        </Box>
    );

    if (error) return <Typography>Error: {error}</Typography>;

    if (!patientData) {
        console.log("Patient data is not available:", patientData);
        return <Typography>No patient data available</Typography>;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '800px',
                margin: 'auto',
                padding: '20px',
                backgroundColor: '#f8f6f6',
                boxSizing: 'border-box',
            }}
        >
            <>
                <Block
                    title="Personal Information"
                    isOpen={expandedBlock === 'personalInfo'}
                    onClick={() => toggleBlock('personalInfo')}
                >
                    <Typography><strong>Patient ID:</strong> {patientData.patientID || 'N/A'}</Typography>
                    <Typography><strong>NHI:</strong> {patientData.nhi || 'N/A'}</Typography>
                    <Typography><strong>First Name:</strong> {patientData.firstName || 'N/A'}</Typography>
                    <Typography><strong>Middle Name:</strong> {patientData.middleName || 'N/A'}</Typography>
                    <Typography><strong>Last Name:</strong> {patientData.lastName || 'N/A'}</Typography>
                    <Typography><strong>Date of Birth:</strong> {new Date(patientData.dateOfBirth).toLocaleDateString() || 'N/A'}</Typography>
                    <Typography><strong>Gender:</strong> {patientData.gender || 'N/A'}</Typography>
                    <Typography><strong>Blood Group:</strong> {patientData.bloodGroup || 'N/A'}</Typography>
                    <Typography><strong>Ethnicity:</strong> {patientData.ethnicity || 'N/A'}</Typography>
                    <Typography><strong>Address:</strong> {patientData.address || 'N/A'}</Typography>
                    <Typography><strong>Phone:</strong> {patientData.phone || 'N/A'}</Typography>
                    <Typography><strong>Email:</strong> {patientData.email || 'N/A'}</Typography>
                </Block>

                <Block
                    title="Emergency Contact"
                    isOpen={expandedBlock === 'emergencyContact'}
                    onClick={() => toggleBlock('emergencyContact')}
                >
                    <Typography><strong>Name:</strong> {patientData.emergencyContact?.name || 'N/A'}</Typography>
                    <Typography><strong>Phone:</strong> {patientData.emergencyContact?.phone || 'N/A'}</Typography>
                    <Typography><strong>Relationship:</strong> {patientData.emergencyContact?.relationship || 'N/A'}</Typography>
                </Block>

                <Block
                    title="Medical History"
                    isOpen={expandedBlock === 'medicalHistory'}
                    onClick={() => toggleBlock('medicalHistory')}
                >
                    <Typography><strong>Chronic Diseases:</strong> {patientData.medicalHistory?.chronicDiseases || 'N/A'}</Typography>
                    <Typography><strong>Past Surgeries:</strong> {patientData.medicalHistory?.pastSurgeries || 'N/A'}</Typography>
                    <Typography><strong>Family Medical History:</strong> {patientData.medicalHistory?.familyMedicalHistory || 'N/A'}</Typography>
                    <Typography><strong>Medication List:</strong> {patientData.medicalHistory?.medicationList || 'N/A'}</Typography>
                    <Typography><strong>Allergies:</strong> {patientData.medicalHistory?.allergies || 'N/A'}</Typography>
                </Block>

                <Block
                    title="Assigned General Practitioner"
                    isOpen={expandedBlock === 'gp'}
                    onClick={() => toggleBlock('gp')}
                >
                    <Typography><strong>GP:</strong> {patientData.gp || 'N/A'}</Typography>
                </Block>

                <Block
                    title="Insurance"
                    isOpen={expandedBlock === 'insurance'}
                    onClick={() => toggleBlock('insurance')}
                >
                    <Typography><strong>Provider:</strong> {patientData.insurance?.provider || 'N/A'}</Typography>
                    <Typography><strong>Policy Number:</strong> {patientData.insurance?.policyNumber || 'N/A'}</Typography>
                </Block>

                <ImageDisplay userId={patientData._id} />

                <Button
                    variant="contained"
                    sx={{
                        mt: 4,
                        backgroundColor: '#03035d',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: '#03035d',
                        }
                    }}
                    onClick={handleBackToAdminPanel}
                >
                    Back to Admin Panel
                </Button>
            </>
        </Box>
    );
}

function Block({ title, isOpen, onClick, children }) {
    return (
        <Box
            onClick={onClick}
            sx={{
                width: '100%',
                padding: '15px',
                marginBottom: '15px',
                border: '2px solid #03035d',
                borderRadius: '10px',
                cursor: 'pointer',
                backgroundColor: '#f8f6f6',
                boxShadow: isOpen ? '0 0 10px rgba(0, 0, 0, 0.1)' : 'none',
            }}
        >
            <Typography variant="h6" sx={{ color: '#03035d', marginBottom: '10px' }}>{title}</Typography>
            <Collapse in={isOpen}>
                <Box sx={{ paddingLeft: '10px' }}>
                    {children}
                </Box>
            </Collapse>
        </Box>
    );
}

ReadPatient.propTypes = {
    returnPath: PropTypes.string.isRequired,
};

Block.propTypes = {
    title: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

export default ReadPatient;
