import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axiosApiInstance from '../utils/axiosInstance';
import { Typography, Box, Divider } from '@mui/material';

function ReadUser({ userId }) {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosApiInstance.get(`/api/auth/user/${userId}`);
                setUserData(response.data.user);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography>Error: {error}</Typography>;

    return (
        <Box>
            <Typography variant="h6">User Information</Typography>
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

            <Typography variant="h6">Emergency Contact</Typography>
            <Typography><strong>Name:</strong> {userData.emergencyContact.name}</Typography>
            <Typography><strong>Phone:</strong> {userData.emergencyContact.phone}</Typography>
            <Typography><strong>Relationship:</strong> {userData.emergencyContact.relationship}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6">Medical History</Typography>
            <Typography><strong>Chronic Diseases:</strong> {userData.medicalHistory.chronicDiseases}</Typography>
            <Typography><strong>Past Surgeries:</strong> {userData.medicalHistory.pastSurgeries}</Typography>
            <Typography><strong>Family Medical History:</strong> {userData.medicalHistory.familyMedicalHistory}</Typography>
            <Typography><strong>Medication List:</strong> {userData.medicalHistory.medicationList}</Typography>
            <Typography><strong>Allergies:</strong> {userData.medicalHistory.allergies}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6">General Practitioner (GP)</Typography>
            <Typography><strong>GP:</strong> {userData.gp}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6">Insurance</Typography>
            <Typography><strong>Provider:</strong> {userData.insurance.provider}</Typography>
            <Typography><strong>Policy Number:</strong> {userData.insurance.policyNumber || 'N/A'}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6">Appointments</Typography>
            {userData.appointments.length > 0 ? (
                userData.appointments.map((appointment, index) => (
                    <Typography key={index}><strong>Appointment {index + 1}:</strong> {new Date(appointment.date).toLocaleDateString()} - ID: {appointment.appointmentID}</Typography>
                ))
            ) : (
                <Typography>No appointments available.</Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6">Images</Typography>
            {userData.images.length > 0 ? (
                userData.images.map((image, index) => (
                    <Typography key={index}><strong>Image {index + 1}:</strong> {image}</Typography>
                ))
            ) : (
                <Typography>No images available.</Typography>
            )}
        </Box>
    );
}

// Add PropTypes validation
ReadUser.propTypes = {
    userId: PropTypes.string.isRequired,
};

export default ReadUser;
