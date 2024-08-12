import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axiosApiInstance from '../utils/axiosInstance';
import { Typography, Box, Divider, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function ReadUser({ userId }) {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [updatedData, setUpdatedData] = useState({});
    const navigate = useNavigate(); // 使用 useNavigate 进行页面导航

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedData({ ...updatedData, [name]: value });
    };

    const updateUserData = async () => {
        try {
            const response = await axiosApiInstance.put(`/api/auth/user/${userId}`, updatedData);
            setUserData(response.data.user);  // 更新用户数据
            setEditMode(false);  // 退出编辑模式
            navigate(`/user`);  // 跳转到 /user 页面
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography>Error: {error}</Typography>;

    return (
        <Box>
            {editMode ? (
                <Box>
                    <Typography variant="h6">Edit User Information</Typography>
                    <TextField
                        label="First Name"
                        name="firstName"
                        defaultValue={userData.firstName}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Middle Name"
                        name="middleName"
                        defaultValue={userData.middleName}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Last Name"
                        name="lastName"
                        defaultValue={userData.lastName}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Date of Birth"
                        name="dateOfBirth"
                        defaultValue={new Date(userData.dateOfBirth).toISOString().split('T')[0]}
                        onChange={handleInputChange}
                        type="date"
                        fullWidth
                        margin="normal"
                    />
                    {/* 其他表单字段 */}
                    <Button variant="contained" color="primary" onClick={updateUserData}>Update</Button>
                    <Button variant="outlined" color="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
                </Box>
            ) : (
                <>
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

                    <Divider sx={{ my: 2 }} />

                    <Button variant="contained" color="primary" onClick={() => setEditMode(true)}>Edit</Button>
                </>
            )}
        </Box>
    );
}

// Add PropTypes validation
ReadUser.propTypes = {
    userId: PropTypes.string.isRequired,
};

export default ReadUser;
