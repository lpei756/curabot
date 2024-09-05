import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { fetchUserData } from '../../services/userService';
import { fetchUserAppointments } from '../../services/appointmentService';
import { fetchTestResults } from '../../services/testResultService'; // Import the new function
import Lottie from 'lottie-react';
import animationData from '../../assets/loading.json';
import { Box, Typography } from '@mui/material';
import { DayPicker } from 'react-day-picker';
import '../../App.css';

const Dashboard = () => {
    const { userId } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [testResults, setTestResults] = useState(null); // State for test results
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(undefined);

    useEffect(() => {
        if (!userId) {
            setLoading(true);
            return;
        }

        const loadData = async () => {
            try {
                const userDataResponse = await fetchUserData(userId);
                if (!userDataResponse || userDataResponse.error) {
                    throw new Error(userDataResponse?.message || 'Failed to fetch user data');
                }
                setUserData(userDataResponse);

                const appointmentsResponse = await fetchUserAppointments(userId);
                if (!Array.isArray(appointmentsResponse) || appointmentsResponse.error) {
                    throw new Error(appointmentsResponse?.message || 'Failed to fetch appointments');
                }
                setAppointments(appointmentsResponse);

                const testResultsResponse = await fetchTestResults();
                if (testResultsResponse.noResults) {
                    setTestResults([]); // Set an empty array if no results
                } else {
                    setTestResults(testResultsResponse);
                }

            } catch (err) {
                setError(err.message || 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [userId]);

    const filterAppointmentsByDate = () => {
        if (selectedDate) {
            return appointments.filter(
                (appointment) =>
                    new Date(appointment.dateTime).toLocaleDateString() ===
                    selectedDate.toLocaleDateString()
            );
        }
        const now = new Date();
        return appointments.filter(
            (appointment) => new Date(appointment.dateTime) >= now
        );
    };

    const filteredAppointments = filterAppointmentsByDate();
    const upcomingAppointment = filteredAppointments.length > 0 ? filteredAppointments[0] : null;

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
        return <Typography variant="h6" color="error">Error: {error}</Typography>;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                width: '100%',
                maxWidth: '1200px',
                margin: 'auto',
                padding: '20px',
                backgroundColor: '#f8f6f6',
                boxSizing: 'border-box'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '38%',
                    border: '1px solid rgba(0, 0, 0, 0.3)',
                    borderRadius: '50px',
                    padding: '20px'
                }}
            >
                <Box sx={{ marginBottom: '10px', height: '385px', overflow: 'hidden' }}>
                    <DayPicker
                        mode="single"
                        classNames={{
                            today: 'my-today',
                        }}
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        footer={null}
                    />
                </Box>

                <Box
                    sx={{
                        width: '100%',
                        height: '1px',
                        backgroundColor: '#03035d',
                        marginY: '10px'
                    }}
                />

                <Box sx={{ marginTop: '10px', height: '160px', overflowY: 'auto' }}>
                    {selectedDate && filteredAppointments.length > 0 ? (
                        filteredAppointments.map((appointment) => (
                            <Box key={appointment._id} sx={{ marginBottom: '10px' }}>
                                <Typography variant="body1">Patient: {appointment.patientName}</Typography>
                                <Typography variant="body1">Date: {new Date(appointment.dateTime).toLocaleDateString()}</Typography>
                                <Typography variant="body1">Clinic: {appointment.clinic._id}</Typography>
                                <Typography variant="body1">Doctor: {appointment.assignedGP}</Typography>
                                <Typography variant="body1">Status: {appointment.status}</Typography>
                            </Box>
                        ))
                    ) : (
                        upcomingAppointment ? (
                            <Box>
                                <Typography variant="h5">Upcoming Appointment:</Typography>
                                <Typography variant="body1">Patient: {upcomingAppointment.patientName}</Typography>
                                <Typography variant="body1">Date: {new Date(upcomingAppointment.dateTime).toLocaleDateString()}</Typography>
                                <Typography variant="body1">Clinic: {upcomingAppointment.clinic._id}</Typography>
                                <Typography variant="body1">Doctor: {upcomingAppointment.assignedGP}</Typography>
                                <Typography variant="body1">Status: {upcomingAppointment.status}</Typography>
                            </Box>
                        ) : (
                            <Typography>No appointment for the day.</Typography>
                        )
                    )}
                </Box>
            </Box>

            <Box
                sx={{
                    width: '600px',
                    maxWidth: '100%',
                    margin: 'auto',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    padding: '20px',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: '50px',
                }}
            >
                {userData ? (
                    <Box>
                        {[
                            { label: 'Patient ID:', value: userData.patientID },
                            { label: 'Name:', value: `${userData.firstName} ${userData.lastName}` },
                            { label: 'Date of Birth:', value: userData.dateOfBirth },
                            { label: 'Gender:', value: userData.gender },
                            { label: 'Ethnicity:', value: userData.ethnicity },
                            { label: 'Email:', value: userData.email },
                            { label: 'GP:', value: userData.gp }
                        ].map(({ label, value }, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '10px'
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#03035d' }}>
                                    {label}
                                </Typography>
                                <Typography variant="h6">
                                    {value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Typography>No user data available</Typography>
                )}
                <Box
                    sx={{
                        marginTop: '20px',
                        padding: '10px',
                        border: '1px solid rgba(0, 0, 0, 0.2)',
                        borderRadius: '10px',
                        backgroundColor: '#fff',
                    }}
                >
                    {testResults === null ? (
                        <Typography>Loading test results...</Typography>
                    ) : testResults.length === 0 ? (
                        <Typography>No test results</Typography>
                    ) : (
                        testResults.map((result) => (
                            <Box key={result._id} sx={{ marginBottom: '10px' }}>
                                <Typography variant="body1">Test ID: {result._id}</Typography>
                                <Typography variant="body1">Test Name: {result.testName}</Typography>
                                <Typography variant="body1">Result: {result.result}</Typography>
                                <Typography variant="body1">Date: {new Date(result.date).toLocaleDateString()}</Typography>
                            </Box>
                        ))
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;