import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ImageDisplay from '../image/ImageDisplay';
import { fetchUserData } from '../../services/userService';
import EditUser from './EditUser';

function ReadUser({ userId }) {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    useNavigate();
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const data = await fetchUserData(userId);
                setUserData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [userId]);

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography>Error: {error}</Typography>;

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
                border: '2px solid #03035d',
                borderRadius: '15px',
                backgroundColor: '#f9f9f9',
                boxSizing: 'border-box'
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
                    <Typography variant="h6" sx={{ color: '#03035d', marginBottom: '20px' }}>User Information</Typography>
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

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" sx={{ color: '#03035d', marginBottom: '10px' }}>Emergency Contact</Typography>
                    <Typography><strong>Name:</strong> {userData.emergencyContact.name}</Typography>
                    <Typography><strong>Phone:</strong> {userData.emergencyContact.phone}</Typography>
                    <Typography><strong>Relationship:</strong> {userData.emergencyContact.relationship}</Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" sx={{ color: '#03035d', marginBottom: '10px' }}>Medical History</Typography>
                    <Typography><strong>Chronic Diseases:</strong> {userData.medicalHistory.chronicDiseases}</Typography>
                    <Typography><strong>Past Surgeries:</strong> {userData.medicalHistory.pastSurgeries}</Typography>
                    <Typography><strong>Family Medical History:</strong> {userData.medicalHistory.familyMedicalHistory}</Typography>
                    <Typography><strong>Medication List:</strong> {userData.medicalHistory.medicationList}</Typography>
                    <Typography><strong>Allergies:</strong> {userData.medicalHistory.allergies}</Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" sx={{ color: '#03035d', marginBottom: '10px' }}>General Practitioner (GP)</Typography>
                    <Typography><strong>GP:</strong> {userData.gp}</Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" sx={{ color: '#03035d', marginBottom: '10px' }}>Insurance</Typography>
                    <Typography><strong>Provider:</strong> {userData.insurance.provider}</Typography>
                    <Typography><strong>Policy Number:</strong> {userData.insurance.policyNumber || 'N/A'}</Typography>

                    <Divider sx={{ my: 2 }} />

                    <ImageDisplay userId={userId} />

                    <Divider sx={{ my: 2 }} />

                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#03035d',
                            color: '#fff',
                            marginTop: '10px',
                        }}
                        onClick={() => setEditMode(true)}
                    >
                        Edit
                    </Button>
                </>
            )}
        </Box>
    );
}

ReadUser.propTypes = {
    userId: PropTypes.string.isRequired,
};

export default ReadUser;
