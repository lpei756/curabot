import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, Button, Collapse } from '@mui/material';
import ImageDisplay from '../image/ImageDisplay';
import { fetchUserData } from '../../services/userService';
import Lottie from 'lottie-react';
import animationData from '../../assets/loading.json';
import EditUser from './EditUser';
import { getDoctorById } from '../../services/doctorService';
import { AuthContext } from "../../context/AuthContext";

function ReadUser() {
    const [userData, setUserData] = useState(null);
    const [doctorName, setDoctorName] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [expandedBlock, setExpandedBlock] = useState(null);
    const { userId } = useContext(AuthContext);

    useEffect(() => {
        if (!userId) {
            setLoading(true);
            return;
        }

        const loadUserData = async () => {
            try {
                const data = await fetchUserData(userId);
                setUserData(data);
                if (data.gp && data.gp !== 'Not assigned') {
                    const doctor = await getDoctorById(data.gp);
                    setDoctorName(`${doctor.firstName} ${doctor.lastName}`);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [userId]);

    const toggleBlock = (block) => {
        setExpandedBlock(expandedBlock === block ? null : block);
    };

    if (loading) {
        return (
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
    }

    if (error) {
        return <Typography>Error: {error}</Typography>;
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
                color: 'black'
            }}
        >
            {editMode ? (
                <EditUser
                    userData={userData}
                    setUserData={setUserData}
                    userId={userId}
                    setEditMode={setEditMode}
                />
            ) : (
                <>
                    <Block
                        title="Personal Information"
                        isOpen={expandedBlock === 'personalInfo'}
                        onClick={() => toggleBlock('personalInfo')}
                    >
                        <Typography><strong>Patient ID:</strong> {userData.patientID}</Typography>
                        <Typography><strong>NHI:</strong> {userData.nhi}</Typography>
                        <Typography><strong>First Name:</strong> {userData.firstName}</Typography>
                        <Typography><strong>Middle Name:</strong> {userData.middleName || 'N/A'}</Typography>
                        <Typography><strong>Last Name:</strong> {userData.lastName}</Typography>
                        <Typography><strong>Date of Birth:</strong> {new Date(userData.dateOfBirth).toLocaleDateString()}</Typography>
                        <Typography><strong>Gender:</strong> {userData.gender}</Typography>
                        <Typography><strong>Blood Group:</strong> {userData.bloodGroup}</Typography>
                        <Typography><strong>Ethnicity:</strong> {userData.ethnicity}</Typography>
                        <Typography><strong>Address:</strong> {userData.address}</Typography>
                        <Typography><strong>Phone:</strong> {userData.phone}</Typography>
                        <Typography><strong>Email:</strong> {userData.email}</Typography>
                    </Block>

                    <Block
                        title="Emergency Contact"
                        isOpen={expandedBlock === 'emergencyContact'}
                        onClick={() => toggleBlock('emergencyContact')}
                    >
                        <Typography><strong>Name:</strong> {userData.emergencyContact.name}</Typography>
                        <Typography><strong>Phone:</strong> {userData.emergencyContact.phone}</Typography>
                        <Typography><strong>Relationship:</strong> {userData.emergencyContact.relationship}</Typography>
                    </Block>

                    <Block
                        title="Medical History"
                        isOpen={expandedBlock === 'medicalHistory'}
                        onClick={() => toggleBlock('medicalHistory')}
                    >
                        <Typography><strong>Chronic Diseases:</strong> {userData.medicalHistory.chronicDiseases}</Typography>
                        <Typography><strong>Past Surgeries:</strong> {userData.medicalHistory.pastSurgeries}</Typography>
                        <Typography><strong>Family Medical History:</strong> {userData.medicalHistory.familyMedicalHistory}</Typography>
                        <Typography><strong>Medication List:</strong> {userData.medicalHistory.medicationList}</Typography>
                        <Typography><strong>Allergies:</strong> {userData.medicalHistory.allergies}</Typography>
                    </Block>

                    <Block
                        title="Assigned General Practitioner"
                        isOpen={expandedBlock === 'gp'}
                        onClick={() => toggleBlock('gp')}
                    >
                        <Typography><strong>GP:</strong> {doctorName || 'Not Assigned'}</Typography>
                    </Block>

                    <Block
                        title="Insurance"
                        isOpen={expandedBlock === 'insurance'}
                        onClick={() => toggleBlock('insurance')}
                    >
                        <Typography><strong>Provider:</strong> {userData.insurance.provider}</Typography>
                        <Typography><strong>Policy Number:</strong> {userData.insurance.policyNumber || 'N/A'}</Typography>
                    </Block>

                    <ImageDisplay userId={userId} />

                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#03035d',
                            color: '#fff',
                            marginTop: '20px',
                        }}
                        onClick={() => setEditMode(true)}
                    >
                        Edit Profile Information
                    </Button>
                </>
            )}
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

Block.propTypes = {
    title: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

export default ReadUser;
