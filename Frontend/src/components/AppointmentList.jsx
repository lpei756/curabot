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

// Example delete button handler
const handleDelete = async (appointmentID) => {
    try {
      console.log(`Attempting to delete appointment with ID: ${appointmentID}`);
      await deleteAppointment(appointmentID);
      // Optionally, update the UI or state to reflect the deletion
    } catch (error) {
      console.error('Error deleting appointment:', error);
      // Optionally, show an error message to the user
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>My Appointments</h1>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <ul>
          {appointments.map((appointment) => (
            <li key={appointment._id}>
              <p>Patient Name: {appointment.patientName}</p>
              <p>Date: {new Date(appointment.dateTime).toLocaleString()}</p>
              <p>Type: {appointment.typeOfVisit}</p>
              <p>Status: {appointment.status}</p>
              <button>Edit</button>
              <button onClick={() => handleDelete(appointment.appointmentID)}>Cancel</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AppointmentList;
