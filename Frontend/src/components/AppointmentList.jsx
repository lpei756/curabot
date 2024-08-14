import { useEffect, useState } from 'react';
import { fetchUserAppointments, deleteAppointment } from '../services/appointmentService';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleDelete = async (appointmentID) => {
    try {
      console.log(`Attempting to delete appointment with ID: ${appointmentID}`);
      await deleteAppointment(appointmentID);
      setAppointments(appointments.filter(app => app.appointmentID !== appointmentID));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const handleBookingClick = () => {
    window.location.href = 'http://localhost:5173/appointment/new';
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>My Appointments</h1>
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
      <ul style={{ listStyleType: 'none', padding: 0, width: '80%', maxWidth: '600px' }}>
        {appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          appointments.map((appointment) => (
            <li key={appointment._id} style={{ 
              border: '2px solid #03035d', 
              margin: '10px', 
              padding: '10px', 
              borderRadius: '15px',
              textAlign: 'center', 
              backgroundColor: '#f9f9f9' // Optional: for better visual appeal
            }}>
              <p>Patient Name: {appointment.patientName}</p>
              <p>Date: {new Date(appointment.dateTime).toLocaleString()}</p>
              <p>Type: {appointment.typeOfVisit}</p>
              <p>Status: {appointment.status}</p>
              <p>Clinic: {appointment.clinicName}</p>
              <p>Doctor: {appointment.doctorName}</p>
              <div>
                <button style={{ border: '2px solid #03035d', marginRight: '5px' }}>Edit</button>
                <button
                  onClick={() => handleDelete(appointment.appointmentID)}
                  style={{
                    backgroundColor: '#03035d',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default AppointmentList;