import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Clinic from '../models/Clinic.js';
import User from '../models/User.js';

export const createAppointment = async ({
  dateTime,
  typeOfVisit,
  purposeOfVisit,
  clinic,
  assignedGP,
  status = 'scheduled',
  notes,
  prescriptionsIssued,
  patientID,
  patientName
}) => {
  try {
    console.log('Appointment Data to be sent:', {
      dateTime,
      typeOfVisit,
      purposeOfVisit,
      clinic,
      assignedGP,
      status,
      notes,
      prescriptionsIssued,
      patientID,
      patientName
    });

    if (!patientID) {
      return { error: true, status: 400, message: 'Patient ID is required' };
    }

    if (!patientName) {
      const user = await User.findOne({ patientID });
      if (!user) {
        return { error: true, status: 404, message: 'User not found' };
      }
      patientName = `${user.firstName} ${user.lastName}`;
    }

    const clinicData = await Clinic.findById(clinic);
    if (!clinicData) {
      return { error: true, status: 404, message: 'Clinic not found' };
    }

    //const doctor = await Doctor.findOne({ doctorID: assignedGP, clinic });
    //if (!doctor) {
    //  console.log('Querying for doctor with:', { doctorID: assignedGP, clinic });
    //  return { error: true, status: 404, message: 'Doctor not found for the selected clinic' };
    //}

    const newAppointment = new Appointment({
      dateTime,
      typeOfVisit,
      purposeOfVisit,
      clinic: clinicData._id,
      assignedGP,
      status,
      notes,
      prescriptionsIssued,
      patientID,
      patientName
    });

    await newAppointment.save();
    return { error: false, appointment: newAppointment };
  } catch (error) {
    console.error('Error creating appointment:', error.message);
    return { error: true, status: 500, message: 'An error occurred while creating the appointment' };
  }
};

export const getAppointmentsForUser = async (patientID) => {
  try {
    if (typeof patientID !== 'string') {
      throw new Error('Invalid patientID format');
    }

    const appointments = await Appointment.find({ patientID });

    return appointments;
  } catch (error) {
    console.error('Error fetching appointments in service:', error);
    throw new Error('Internal server error');
  }
};

export const readAppointment = async (appointmentId, patientID) => {
  try {
    const appointment = await Appointment.findOne({ appointmentID: appointmentId, patientID });

    if (!appointment) {
      return { error: true, status: 404, message: 'Appointment not found' };
    }

    return appointment;
  } catch (error) {
    console.error('Error reading appointment:', error);
    return { error: true, status: 500, message: 'Internal server error' };
  }
};

export const updateAppointment = async (appointmentId, updateData, patientID) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { appointmentID: appointmentId, patientID },
      updateData,
      { new: true }
    );

    if (!appointment) {
      return { error: true, status: 404, message: 'Appointment not found or not authorized to update' };
    }

    return appointment;
  } catch (error) {
    console.error('Error updating appointment:', error);
    return { error: true, status: 500, message: 'Internal server error' };
  }
};

export const deleteAppointment = async (appointmentId) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { appointmentID: appointmentId },
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return { error: true, status: 404, message: 'Appointment not found' };
    }

    const user = await User.findOne({ 'appointments.appointmentID': appointmentId });

    if (user) {
      await User.updateOne(
        { 'appointments.appointmentID': appointmentId },
        {
          $set: {
            'appointments.$.status': 'cancelled'
          }
        }
      );
    }

    return { error: false, message: 'Appointment cancelled successfully' };
  } catch (error) {
    console.error('Error cancelling appointment in service:', error);
    return { error: true, status: 500, message: 'Internal server error' };
  }
};
