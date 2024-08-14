import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Container,
  Box,
} from '@mui/material';
import { readAppointment } from '../../services/appointmentService';

const ReadAppointment = () => {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const appointmentData = await readAppointment(appointmentId);
        setAppointment(appointmentData);
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Failed to fetch appointment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const handleBack = () => {
    navigate('/appointments');
  };

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <CardContent>
          <Typography variant="h5" component="div">
            Appointment Details
          </Typography>
          <Box mt={2}>
            <Typography variant="body1">
              <strong>Patient Name:</strong> {appointment.patientName}
            </Typography>
            <Typography variant="body1">
              <strong>Patient ID:</strong> {appointment.patientID}
            </Typography>
            <Typography variant="body1">
              <strong>Appointment ID:</strong> {appointment.appointmentID}
            </Typography>
            <Typography variant="body1">
              <strong>Date and Time:</strong> {new Date(appointment.dateTime).toLocaleString()}
            </Typography>
            <Typography variant="body1">
              <strong>Type of Visit:</strong> {appointment.typeOfVisit}
            </Typography>
            <Typography variant="body1">
              <strong>Purpose of Visit:</strong> {appointment.purposeOfVisit}
            </Typography>
            <Typography variant="body1">
              <strong>Assigned GP:</strong> {appointment.assignedGP}
            </Typography>
            <Typography variant="body1">
              <strong>Clinic ID:</strong> {appointment.clinic}
            </Typography>
            <Typography variant="body1">
              <strong>Status:</strong> {appointment.status}
            </Typography>
          </Box>
        </CardContent>
      </Card>
      <Box mt={2}>
        <Button variant="contained" onClick={handleBack}>
          Back to Appointments
        </Button>
      </Box>
    </Container>
  );
};

export default ReadAppointment;
