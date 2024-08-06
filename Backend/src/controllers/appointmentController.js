import User from '../models/User.js';
import { createAppointment as createAppointmentService , readAppointment as readAppointmentService , updateAppointment as updateAppointmentService , deleteAppointment as deleteAppointmentService} from '../services/appointmentService.js';


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

    // Use the service to read the appointment
    const result = await readAppointmentService(appointmentId, user.patientID);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json(result);
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

    // Fetch the user to get their patient ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Use the service to update the appointment
    const result = await updateAppointmentService(appointmentId, updateData, user.patientID);

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
      const { appointmentId } = req.params;

      const result = await deleteAppointmentService(appointmentId);

      if (result.error) {
        return res.status(result.status).json({ message: result.message });
      }

      res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
