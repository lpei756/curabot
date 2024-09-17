import User from '../models/User.js';
import { createAppointment as createAppointmentService, readAppointment as readAppointmentService, updateAppointment as updateAppointmentService, deleteAppointment as deleteAppointmentService, getAppointmentsForUser, getAppointmentsForAUser } from '../services/appointmentService.js';

export const createAppointment = async (req, res) => {
  try {
    const appointmentData = req.body;
    const userId = req.user?._id;
    const userRole = req.user?.role;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (userRole !== 'doctor' && userRole !== 'nurse') {
      delete appointmentData.notes;
      delete appointmentData.prescriptionsIssued;
    }
    const patientName = `${user.firstName} ${user.lastName}`;
    const appointment = await createAppointmentService({
      ...appointmentData,
      patientID: user.patientID,
      patientName
    });
    if (appointment.error) {
      return res.status(appointment.status).json({ message: appointment.message });
    }
    await User.findByIdAndUpdate(userId, {
      $push: {
        appointments: {
          appointmentID: appointment.appointment.appointmentID,
          date: appointment.appointment.dateTime
        }
      }
    });
    res.status(201).json(appointment.appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const readAppointment = async (req, res) => {
  try {
    const { appointmentID } = req.params;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const result = await readAppointmentService(appointmentID, user.patientID);
    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error('Error reading appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const fetchAllAppointments = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const patientID = user.patientID;
    if (!patientID) return res.status(400).json({ message: 'Patient ID not found' });
    const appointments = await getAppointmentsForUser(patientID);
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { appointmentID } = req.params;
    const updateData = req.body;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const result = await updateAppointmentService(appointmentID, updateData, user.patientID);
    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { appointmentID } = req.params;
    console.log(`Attempting to cancel appointment with ID: ${appointmentID}`);
    const result = await deleteAppointmentService(appointmentID);
    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }
    res.status(200).json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const fetchAllAppointment = async (req, res) => {
  try {
    const { patientID } = req.params;
    if (!patientID) return res.status(400).json({ message: 'Patient ID is required' });
    const appointments = await getAppointmentsForAUser(patientID);
    if (appointments.error) {
      return res.status(appointments.status).json({ message: appointments.message });
    }
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments for the user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
