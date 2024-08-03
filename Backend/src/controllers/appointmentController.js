import User from '../models/User.js';
import { createAppointment as createAppointmentService } from '../services/appointmentService.js';

export const createAppointment = async (req, res) => {
  try {
    const appointmentData = req.body;
    const userId = req.user?.user?._id;

    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    // Fetch the user to get their name
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Construct the patient's full name
    const patientName = `${user.firstName} ${user.lastName}`;

    // Include the patientName in the appointmentData
    const appointment = await createAppointmentService({ ...appointmentData, patientID: user.patientID, patientName });
    
    if (appointment.error) {
      return res.status(appointment.status).json({ message: appointment.message });
    }

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};