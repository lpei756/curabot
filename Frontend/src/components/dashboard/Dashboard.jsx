import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { fetchUserData } from '../../services/userService';
import { fetchUserAppointments } from '../../services/appointmentService';
import Lottie from 'lottie-react';
import animationData from '../../assets/loading.json';
import { Box, Typography } from '@mui/material';
import { DayPicker } from 'react-day-picker';
import '../../App.css';

const Dashboard = () => {
  const { userId } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
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
        console.log('Fetching user data and appointments...');

        const userDataResponse = await fetchUserData(userId);
        if (!userDataResponse || userDataResponse.error) {
          throw new Error(userDataResponse?.message || 'Failed to fetch user data');
        }
        setUserData(userDataResponse);

        const appointmentsResponse = await fetchUserAppointments(userId);
        console.log('Appointments Response:', appointmentsResponse); // Debugging line

        if (!Array.isArray(appointmentsResponse) || appointmentsResponse.error) {
          throw new Error(appointmentsResponse?.message || 'Failed to fetch appointments');
        }
        setAppointments(appointmentsResponse);

      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

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
        alignItems: 'center',
        width: '100%',
        maxWidth: '1200px',
        margin: 'auto',
        padding: '20px',
        backgroundColor: '#f8f6f6',
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ width: '100%', marginBottom: '40px', color: '#03035d' }}>
        {userData ? (
          <Box>
            <Typography variant="h6">Patient ID: {userData.patientID}</Typography>
            <Typography variant="h6">Name: {userData.firstName} {userData.lastName}</Typography>
            {/* Add more user data fields as needed */}
          </Box>
        ) : (
          <Typography>No user data available</Typography>
        )}
      </Box>

      <Box sx={{ width: '100%', marginBottom: '40px' }}>
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

      <Box sx={{ width: '100%', color: '#03035d' }}>
        {appointments.length > 0 ? (
          <Box>
            {appointments.map((appointment) => (
              <Box key={appointment._id} sx={{ marginBottom: '10px' }}>
                <Typography variant="body1">Appointment ID: {appointment._id}</Typography>
                <Typography variant="body1">Date: {new Date(appointment.dateTime).toLocaleDateString()}</Typography>
                <Typography variant="body1">Clinic: {appointment.clinic._id}</Typography>
                <Typography variant="body1">Doctor: {appointment.assignedGP}</Typography>
                {/* Add more appointment details as needed */}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography>No appointments available</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;