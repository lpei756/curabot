import User from '../models/User.js';
import { createAppointment as createAppointmentService } from '../services/appointmentService.js';
import Appointment from '../models/Appointment.js';

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
export const readAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user?.user?._id;

    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    // Fetch the user to get their patient ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find the appointment by ID
    const appointment = await Appointment.findOne({ _id: appointmentId, patientID: user.patientID });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error reading appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const updateData = req.body;
    const userId = req.user?.user?._id;

    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    // Fetch the user to get their name (optional, if needed for additional checks)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find the appointment by ID and update it
    const appointment = await Appointment.findOneAndUpdate(
        { _id: appointmentId, patientID: user.patientID },
        updateData,
        { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or not authorized to update' });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
