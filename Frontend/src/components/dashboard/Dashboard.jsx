import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { fetchUserData } from '../../services/userService';
import { fetchUserAppointments } from '../../services/appointmentService';
import { fetchTestResults } from '../../services/testResultService';
import { getDoctorById } from '../../services/doctorService';
import { getClinicById } from '../../services/clinicService';
import Lottie from 'lottie-react';
import animationData from '../../assets/loading.json';
import profileAnimationData from '../../assets/Profile.json';
import prescriptionAnimationData from '../../assets/Prescription.json';
import testResultAnimationData from '../../assets/TestResult.json';
import { Box, Typography } from '@mui/material';
import { DayPicker } from 'react-day-picker';
import '../../App.css';

const Dashboard = () => {
    const { userId } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [testResults, setTestResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(undefined);
    const [hovered, setHovered] = useState({ appointment: false, profile: false, testResult: false, prescription: false });
    const [doctorName, setDoctorName] = useState('');
    const [clinicNames, setClinicNames] = useState({});

    useEffect(() => {
        if (!userId) {
            setLoading(true);
            return;
        }

        const loadData = async () => {
            try {
                // Fetch user data
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
                setTestResults(testResultsResponse.testResults || []);

                const doctorId = userDataResponse.gp;
                if (doctorId) {
                    const doctorName = await fetchDoctorName(doctorId);
                    setDoctorName(doctorName);
                }

                const clinicIds = appointmentsResponse.map(appointment => appointment.clinic._id);
                const uniqueClinicIds = [...new Set(clinicIds)];
                const clinics = await Promise.all(uniqueClinicIds.map(clinicId => getClinicById(clinicId)));
                const clinicNameMap = clinics.reduce((acc, clinic) => {
                    acc[clinic._id] = clinic.name;
                    return acc;
                }, {});
                setClinicNames(clinicNameMap);

            } catch (err) {
                setError(err.message || 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [userId]);

    const fetchDoctorName = async (doctorId) => {
        try {
            const doctor = await getDoctorById(doctorId);
            if (doctor) {
                return `${doctor.firstName} ${doctor.lastName}`;
            } else {
                return 'Unknown Doctor';
            }
        } catch (error) {
            console.error('Error fetching doctor:', error);
            return 'Error fetching doctor';
        }
    };

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

    const formatTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                flexDirection: 'column',
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
                    flexDirection: 'row',
                    width: '100%',
                    marginBottom: '20px'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '40%',
                        border: `1px solid ${hovered.appointment ? '#03035d' : 'rgba(0, 0, 0, 0.2)'}`,
                        borderRadius: '50px',
                        padding: '20px',
                        transition: 'border-color 0.3s'
                    }}
                    onMouseEnter={() => setHovered(prev => ({ ...prev, appointment: true }))}
                    onMouseLeave={() => setHovered(prev => ({ ...prev, appointment: false }))}
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
                                    <Typography variant="h5">Appointments for the day:</Typography>
                                    <Typography variant="body1">Patient: {appointment.patientName}</Typography>
                                    <Typography variant="body1">Time: {formatTime(appointment.dateTime)}</Typography>
                                    <Typography variant="body1">Clinic: {clinicNames[appointment.clinic._id]}</Typography>
                                    <Typography variant="body1">Doctor: {doctorName || appointment.assignedGP}</Typography>
                                    <Typography variant="body1">Status: {appointment.status}</Typography>
                                </Box>
                            ))
                        ) : (
                            upcomingAppointment ? (
                                <Box>
                                    <Typography variant="h5">Upcoming Appointment:</Typography>
                                    <Typography variant="body1">Patient: {upcomingAppointment.patientName}</Typography>
                                    <Typography variant="body1">Time: {formatTime(upcomingAppointment.dateTime)}</Typography>
                                    <Typography variant="body1">Clinic: {clinicNames[upcomingAppointment.clinic._id]}</Typography>
                                    <Typography variant="body1">Doctor: {doctorName || upcomingAppointment.assignedGP}</Typography>
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
                        width: '60%',
                        maxWidth: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        marginLeft: '20px'
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            height: '55%',
                            padding: '20px',
                            border: `1px solid ${hovered.profile ? '#03035d' : 'rgba(0, 0, 0, 0.2)'}`,
                            borderRadius: '50px',
                            marginBottom: '20px',
                            transition: 'border-color 0.3s'
                        }}
                        onMouseEnter={() => setHovered(prev => ({ ...prev, profile: true }))}
                        onMouseLeave={() => setHovered(prev => ({ ...prev, profile: false }))}
                    >
                        {userData ? (
                            <Box>
                                <Typography variant="h5" sx={{ marginTop: '-20px', marginBottom: '-20px', display: 'flex', alignItems: 'center' }}>
                                    {hovered.profile ? (
                                        <Lottie animationData={profileAnimationData} style={{ width: '90px', height: '90px' }} />
                                    ) : (
                                        <img src="/Profile.PNG" alt="Profile Icon" style={{ width: '90px', height: '90px' }} />
                                    )}
                                    Profile
                                </Typography>
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: '1px',
                                        backgroundColor: '#03035d',
                                        marginY: '10px'
                                    }}
                                />
                                {[
                                    { label: 'Patient ID:', value: userData.patientID },
                                    { label: 'Name:', value: `${userData.firstName} ${userData.lastName}` },
                                    { label: 'Date of Birth:', value: userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString('en-CA') : 'N/A' },
                                    { label: 'Gender:', value: userData.gender },
                                    { label: 'Ethnicity:', value: userData.ethnicity },
                                    { label: 'Email:', value: userData.email },
                                    { label: 'GP:', value: doctorName || userData.gp }
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
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '106%',
                            gap: '20px',
                            height: '28%'
                        }}
                    >
                        <Box
                            sx={{
                                width: '50%',
                                height: '100%',
                                padding: '20px',
                                border: `1px solid ${hovered.testResult ? '#03035d' : 'rgba(0, 0, 0, 0.2)'}`,
                                borderRadius: '50px',
                                transition: 'border-color 0.3s'
                            }}
                            onMouseEnter={() => setHovered(prev => ({ ...prev, testResult: true }))}
                            onMouseLeave={() => setHovered(prev => ({ ...prev, testResult: false }))}
                        >
                            <Typography variant="h5" sx={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                                {hovered.testResult ? (
                                    <Lottie animationData={testResultAnimationData} style={{ marginRight: '10px', width: '40px', height: '40px' }} />
                                ) : (
                                    <img src="/TestResult.PNG" alt="TestResult Icon" style={{ marginRight: '10px', width: '40px', height: '40px' }} />
                                )}
                                Test Results
                            </Typography>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '1px',
                                    backgroundColor: '#03035d'
                                }}
                            />
                            {testResults.length > 0 ? (
                                testResults.map((result) => (
                                    <Box key={result._id} sx={{ marginBottom: '10px' }}>
                                        <Typography variant="body1">Test ID: {result._id}</Typography>
                                        <Typography variant="body1">Date: {new Date(result.date).toLocaleDateString()}</Typography>
                                        <Typography variant="body1">Result: {result.result}</Typography>
                                        <Typography variant="body1">Status: {result.status}</Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography>No test results available</Typography>
                            )}
                        </Box>

                        <Box
                            sx={{
                                width: '50%',
                                height: '100%',
                                padding: '20px',
                                border: `1px solid ${hovered.prescription ? '#03035d' : 'rgba(0, 0, 0, 0.2)'}`,
                                borderRadius: '50px',
                                transition: 'border-color 0.3s'
                            }}
                            onMouseEnter={() => setHovered(prev => ({ ...prev, prescription: true }))}
                            onMouseLeave={() => setHovered(prev => ({ ...prev, prescription: false }))}
                        >
                            <Typography variant="h5" sx={{ marginTop: '-20px', marginBottom: '-15px', display: 'flex', alignItems: 'center' }}>
                                {hovered.prescription ? (
                                    <Lottie animationData={prescriptionAnimationData} style={{ width: '80px', height: '80px' }} />
                                ) : (
                                    <img src="/Prescription.PNG" alt="Prescription Icon" style={{ width: '80px', height: '80px' }} />
                                )}
                                Prescription
                            </Typography>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '1px',
                                    backgroundColor: '#03035d'
                                }}
                            />
                            {/* Add your prescription content here */}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;