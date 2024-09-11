import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { fetchUserData } from '../../services/userService';
import { fetchUserAppointments } from '../../services/appointmentService';
import { fetchTestResults } from '../../services/testResultService';
import { getDoctorById } from '../../services/doctorService';
import { getClinicById } from '../../services/clinicService';
import { getAllPrescriptions } from '../../services/PrescriptionService.js';
import Lottie from 'lottie-react';
import animationData from '../../assets/loading.json';
import profileAnimationData from '../../assets/Profile.json';
import prescriptionAnimationData from '../../assets/Prescription.json';
import testResultAnimationData from '../../assets/TestResult.json';
import { Box, Typography } from '@mui/material';
import { DayPicker } from 'react-day-picker';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import '../../App.css';

const Dashboard = () => {
    const { userId } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [testResults, setTestResults] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(undefined);
    const [hovered, setHovered] = useState({ appointment: false, profile: false, testResult: false, prescription: false });
    const [doctorName, setDoctorName] = useState('');
    const [clinicNames, setClinicNames] = useState({});
    const [doctorNames, setDoctorNames] = useState({});
    const navigate = useNavigate();

    const handleAppointmentRedirect = () => {
        navigate('/appointment');
    };

    const handleProfileRedirect = () => {
        navigate('/user');
    };

    const handleTestResultRedirect = () => {
        navigate('/test-result');
    };

    const handlePrescriptionRedirect = () => {
        navigate('/prescriptions');
    };

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
                const sortedResults = testResultsResponse
                    .filter(result => result.dateUploaded)
                    .sort((a, b) => new Date(b.dateUploaded) - new Date(a.dateUploaded));
                const latestTestResult = sortedResults.length > 0 ? sortedResults[0] : null;
                setTestResults(latestTestResult ? [latestTestResult] : []);

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

                const doctorIdMap = {};
                await Promise.all(
                    appointmentsResponse.map(async (appointment) => {
                        const doctorId = appointment.assignedGP;
                        if (doctorId && !doctorIdMap[doctorId]) {
                            const doctorName = await fetchDoctorName(doctorId);
                            doctorIdMap[doctorId] = doctorName;
                        }
                    })
                );
                setDoctorNames(doctorIdMap);

                const prescriptionsResponse = await getAllPrescriptions();
                console.log('API Response:', prescriptionsResponse);

                if (Array.isArray(prescriptionsResponse)) {
                    const filteredPrescriptions = prescriptionsResponse.filter(prescription => prescription.createdAt);
                    console.log('Filtered Prescriptions:', filteredPrescriptions);

                    const sortedPrescriptions = filteredPrescriptions.sort((a, b) => {
                        const dateA = new Date(a.createdAt);
                        const dateB = new Date(b.createdAt);
                        return dateB - dateA;
                    });
                    console.log('Sorted Prescriptions:', sortedPrescriptions);

                    const latestPrescription = sortedPrescriptions.length > 0 ? sortedPrescriptions[0] : null;
                    setPrescriptions(latestPrescription);
                    console.log('Latest Prescription:', latestPrescription);
                } else {
                    console.log('No prescriptions available');
                    setPrescriptions(null);
                }

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

    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleDateString('en-CA') + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                                today: 'my-today'
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
                                    <Typography variant="h5" sx={{ marginBottom: '5px', color: 'black' }}>
                                        Appointment for the day:
                                        <Box
                                            sx={{
                                                marginLeft: '95%',
                                                marginTop: '-7%'
                                            }}
                                            onClick={handleAppointmentRedirect}
                                        >
                                            <ArrowForwardIcon />
                                        </Box>
                                    </Typography>
                                    {[
                                        { label: 'Date & Time:', value: formatDateTime(appointment.dateTime) },
                                        { label: 'Clinic:', value: clinicNames[appointment.clinic._id] || 'N/A' },
                                        { label: 'Doctor:', value: doctorNames[appointment.assignedGP] || 'N/A' },
                                        { label: 'Status:', value: appointment.status },
                                    ].map(({ label, value }, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: '10px',
                                                color: 'black'
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#03035d' }}>
                                                {label}
                                            </Typography>
                                            <Typography variant="body1">{value}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            ))
                        ) : (
                            upcomingAppointment ? (
                                <Box>
                                    <Typography variant="h5" sx={{ marginBottom: '5px', color: 'black' }}>
                                        Upcoming Appointment:
                                        <Box
                                            sx={{
                                                marginLeft: '95%',
                                                marginTop: '-7%'
                                            }}
                                            onClick={handleAppointmentRedirect}
                                        >
                                            <ArrowForwardIcon />
                                        </Box>
                                    </Typography>
                                    {[
                                        { label: 'Date & Time:', value: formatDateTime(upcomingAppointment.dateTime) },
                                        { label: 'Clinic:', value: clinicNames[upcomingAppointment.clinic._id] || 'N/A' },
                                        { label: 'Doctor:', value: doctorNames[upcomingAppointment.assignedGP] || 'N/A' },
                                        { label: 'Status:', value: upcomingAppointment.status },
                                    ].map(({ label, value }, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: '10px',
                                                color: 'black'
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#03035d' }}>
                                                {label}
                                            </Typography>
                                            <Typography variant="body1">{value}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="h5">No appointment for the day.</Typography>
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
                                <Typography
                                    variant="h5"
                                    sx={{
                                        marginTop: '-20px',
                                        marginBottom: '-20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        position: 'relative',
                                        color: 'black'
                                    }}
                                >
                                    {hovered.profile ? (
                                        <Lottie animationData={profileAnimationData} style={{ width: '90px', height: '90px' }} />
                                    ) : (
                                        <img src="/Profile.PNG" alt="Profile Icon" style={{ width: '90px', height: '90px' }} />
                                    )}
                                    Profile
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            right: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            cursor: 'pointer',
                                        }}
                                        onClick={handleProfileRedirect}
                                    >
                                        <ArrowForwardIcon />
                                    </Box>
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
                                            marginBottom: '10px',
                                            color: 'black'
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
                            <Typography variant="h5" sx={{ marginBottom: '5px', display: 'flex', alignItems: 'center', color: 'black' }}>
                                {hovered.testResult ? (
                                    <Lottie animationData={testResultAnimationData} style={{ marginRight: '10px', width: '40px', height: '40px' }} />
                                ) : (
                                    <img src="/TestResult.PNG" alt="TestResult Icon" style={{ marginRight: '10px', width: '40px', height: '40px' }} />
                                )}
                                Test Results
                                <Box
                                    sx={{
                                        marginLeft: '30%'
                                    }}
                                    onClick={handleTestResultRedirect}
                                >
                                    <ArrowForwardIcon />
                                </Box>
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
                                    <Box key={result._id} sx={{ marginBottom: '10px', color: 'black' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: '20px' }}>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#03035d' }}>Test Name:</Typography>
                                            <Typography variant="body1">{result.testName}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#03035d' }}>Date:</Typography>
                                            <Typography variant="body1">{new Date(result.dateUploaded).toLocaleDateString()}</Typography>
                                        </Box>
                                    </Box>
                                ))
                            ) : (
                                <Typography sx={{ color: 'black' }}>No test results available</Typography>
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
                            <Typography variant="h5" sx={{ marginTop: '-20px', marginBottom: '-15px', display: 'flex', alignItems: 'center', color: 'black' }}>
                                {hovered.prescription ? (
                                    <Lottie animationData={prescriptionAnimationData} style={{ width: '80px', height: '80px' }} />
                                ) : (
                                    <img src="/Prescription.PNG" alt="Prescription Icon" style={{ width: '80px', height: '80px' }} />
                                )}
                                Prescription
                                <Box
                                    sx={{
                                        marginLeft: '22%'
                                    }}
                                    onClick={handlePrescriptionRedirect}
                                >
                                    <ArrowForwardIcon />
                                </Box>
                            </Typography>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '1px',
                                    backgroundColor: '#03035d'
                                }}
                            />
                            {prescriptions ? (
                                <Box sx={{ marginBottom: '10px', color: 'black' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: '10px' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#03035d' }}>Medication:</Typography>
                                        <Typography variant="body1">{prescriptions.medications}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#03035d' }}>Prescribed by:</Typography>
                                        <Typography variant="body1">{prescriptions.doctorName || 'Unknown Doctor'}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#03035d' }}>Date:</Typography>
                                        <Typography variant="body1">{prescriptions.createdAt ? new Date(prescriptions.createdAt).toLocaleDateString() : 'No Date Available'}</Typography>
                                    </Box>
                                </Box>
                            ) : (
                                <Typography sx={{ color: 'black' }}>No prescriptions available</Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;
