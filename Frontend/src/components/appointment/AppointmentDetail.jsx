import React, { useState, useEffect } from 'react';
import { Box, Typography, Modal, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { createAppointment } from '../../services/appointmentService'; // Adjust the import path as needed

const StyledModal = styled(Modal)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto',
}));

const StyledBox = styled(Box)(({ theme }) => ({
    color: 'black',
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5],
    width: '90%',
    maxWidth: '600px',
    height: 'auto',
    maxHeight: '80vh',
    overflow: 'auto',
}));

const AppointmentDetail = ({ open, onClose, event }) => {
    const [doctor, setDoctor] = useState(null);
    const [clinic, setClinic] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (event?.doctorID) {
            axios.get(`http://localhost:3001/api/doctors/${event.doctorID}`)
                .then(response => {
                    setDoctor(response.data);

                    const clinicID = response.data.clinic;
                    return axios.get(`http://localhost:3001/api/clinics/${clinicID}`);
                })
                .then(response => {
                    setClinic(response.data);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [event?.doctorID]);

    const handleBooking = async () => {
        if (!event || !doctor || !clinic) return;

        const appointmentData = {
            dateTime: event.start, // Assuming event.start is in ISO format
            clinic: clinic._id,    // Clinic ID from the fetched data
            assignedGP: doctor._id // Doctor ID from the fetched data
        };

        try {
            const result = await createAppointment(appointmentData);
            console.log('Appointment Created:', result);
            // Optionally show a success message or redirect
            onClose(); // Close the modal after booking
        } catch (error) {
            console.error('Error saving appointment:', error.response ? error.response.data : error.message);
        }
    };

    if (!event || loading) return null;

    return (
        <StyledModal 
            open={open} 
            onClose={onClose} 
            aria-labelledby="appointment-details-title" 
            aria-describedby="appointment-details-description"
        >
            <StyledBox>
                <Typography id="appointment-details-title" variant="h6" gutterBottom>
                    Appointment Details
                </Typography>
                <Typography variant="body1">
                    <strong>Title:</strong> {event.title}
                </Typography>
                <Typography variant="body1">
                    <strong>Start:</strong> {new Date(event.start).toLocaleString()}
                </Typography>
                <Typography variant="body1">
                    <strong>End:</strong> {new Date(event.end).toLocaleString()}
                </Typography>
                {doctor && (
                    <Typography variant="body1">
                        <strong>Doctor:</strong> {`${doctor.firstName} ${doctor.lastName}`}
                    </Typography>
                )}
                {clinic && (
                    <>
                        <Typography variant="body1">
                            <strong>Clinic:</strong> {clinic.name}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Location:</strong> {clinic.address}
                        </Typography>
                    </>
                )}
                {doctor?.languagesSpoken && doctor.languagesSpoken.length > 0 && (
                    <Typography variant="body1">
                        <strong>Languages Spoken:</strong> {doctor.languagesSpoken.join(', ')}
                    </Typography>
                )}
                <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                    <Button variant="contained" color="primary" onClick={handleBooking}>
                        Book Appointment
                    </Button>
                    <Button variant="contained" color="secondary" onClick={onClose}>
                        Close
                    </Button>
                </Box>
            </StyledBox>
        </StyledModal>
    );
};

export default AppointmentDetail;
