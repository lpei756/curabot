import { useEffect, useState } from 'react';
import { fetchUserAppointments, deleteAppointment } from '../../services/appointmentService.js';
import { useNavigate } from 'react-router-dom';
import {Box, Button} from "@mui/material";

const AppointmentList = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadAppointments = async () => {
            try {
                const fetchedAppointments = await fetchUserAppointments();
                setAppointments(fetchedAppointments);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadAppointments();
    }, []);

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    const handleEditClick = (appointmentID) => {
        navigate(`/appointment/${appointmentID}/update`);
    };

    const handleBookingClick = (appointmentID) => {
        navigate(`/appointment/new`);
    };

    const handleDelete = async (appointmentID) => {
        try {
            await deleteAppointment(appointmentID);
            setAppointments(appointments.filter(app => app.appointmentID !== appointmentID));
            window.location.reload();
        } catch (error) {
            console.error('Error deleting appointment:', error);
        }
    };

    const handleAppointmentClick = (appointment) => {
        setSelectedAppointment(selectedAppointment === appointment ? null : appointment);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <h1 style={{ color: 'black' }}>My Appointments</h1>
            <button
                onClick={handleBookingClick}
                style={{
                    margin: '10px',
                    padding: '10px 20px',
                    backgroundColor: '#03035d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Booking +
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '1200px' }}>
                <ul style={{
                    listStyleType: 'none',
                    padding: 0,
                    width: selectedAppointment ? '50%' : '50%',
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    {appointments.length === 0 ? (
                        <p>No appointments found.</p>
                    ) : (
                        appointments
                            .slice()
                            .reverse()
                            .map((appointment) => (
                                <li
                                    key={appointment._id}
                                    style={{
                                        border: '2px solid #03035d',
                                        color: 'black',
                                        margin: '10px',
                                        padding: '10px',
                                        borderRadius: '15px',
                                        textAlign: 'center',
                                        backgroundColor: '#f9f9f9',
                                        cursor: 'pointer',
                                        width: selectedAppointment === appointment ? '80%' : '90%',
                                        transition: 'width 0.3s ease',
                                    }}
                                    onClick={() => handleAppointmentClick(appointment)}
                                >
                                    <div>
                                        <p>Patient Name: {appointment.patientName}</p>
                                        <p>Date: {new Date(appointment.dateTime).toLocaleString()}</p>
                                        <p>Status: {appointment.status}</p>
                                        <p>Clinic: {appointment.clinicName}</p>
                                        <p>Doctor: {appointment.doctorName}</p>
                                    </div>
                                </li>
                            ))
                    )}
                </ul>
                {selectedAppointment && (
                    <div style={{
                        width: '50%',
                        padding: '10px',
                        borderLeft: '2px solid #03035d',
                        backgroundColor: '#f8f6f6',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        transition: 'width 0.3s ease',
                        color: 'black'
                    }}>
                        <h2>Details</h2>
                        <p><strong>Patient Name:</strong> {selectedAppointment.patientName}</p>
                        <p><strong>Date:</strong> {new Date(selectedAppointment.dateTime).toLocaleString()}</p>
                        <p><strong>Status:</strong> {selectedAppointment.status}</p>
                        <p><strong>Clinic:</strong> {selectedAppointment.clinicName}</p>
                        <p><strong>Doctor:</strong> {selectedAppointment.doctorName}</p>

                        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
                            <button
                                onClick={() => handleEditClick(selectedAppointment.appointmentID)}
                                style={{
                                    border: '2px solid #03035d',
                                    marginRight: '5px',
                                    padding: '5px 10px',
                                    cursor: 'pointer',
                                }}
                            >
                                Edit Appointment
                            </button>
                            <button
                                onClick={() => handleDelete(selectedAppointment.appointmentID)}
                                style={{
                                    backgroundColor: '#03035d',
                                    color: '#fff',
                                    padding: '10px 20px',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel Appointment
                            </button>


                        </div>
                    </div>
                )}
            </div>
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
                    }}
                    onClick={handleBackToDashboard}
                >
                    Back to Dashboard
                </Button>
            </Box>
        </div>
    );
};

export default AppointmentList;
