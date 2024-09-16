import Appointment from '../models/Appointment.js';
import Clinic from '../models/Clinic.js';
import DoctorAvailability from '../models/DoctorAvailability.js';
import User from '../models/User.js';
import { getDoctorByIdService } from './doctorService.js';

export const createAppointment = async ({
  dateTime,
  clinic,
  assignedGP,
  slotId,
  status = 'Scheduled',
  notes,
  prescriptionsIssued,
  patientID,
  patientName
}) => {
  try {
    console.log('Appointment Data to be sent:', {
      dateTime,
      clinic,
      assignedGP,
      slotId,
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
    const slot = await DoctorAvailability.findById(slotId);
    if (!slot || slot.isBooked) {
      return { error: true, status: 422, message: 'Slot is either invalid or already booked' };
    }
    const newAppointment = new Appointment({
      dateTime,
      clinic: clinicData._id,
      assignedGP,
      slotId,
      status,
      notes,
      prescriptionsIssued,
      patientID,
      patientName
    });
    await newAppointment.save();
    await DoctorAvailability.findByIdAndUpdate(slotId, {
      isBooked: true,
      bookedBy: patientID,
    });
    return { error: false, appointment: newAppointment };
  } catch (error) {
    console.error('Error creating appointment:', error.message);
    return { error: true, status: 500, message: 'An error occurred while creating the appointment' };
  }
};

export const getAppointmentsForUser = async (patientID) => {
  try {
    console.log("patientID received:", patientID);
    if (typeof patientID !== 'string' || !patientID) {
      throw new Error('Invalid patientID format');
    }
    const appointments = await Appointment.find({ patientID })
      .populate('clinic')
      .exec();
    console.log('Fetched appointments!');
    const appointmentsWithDoctorNames = await Promise.all(appointments.map(async (appointment) => {
      console.log('Fetching doctor with ID:', appointment.assignedGP);
      const doctorResult = await getDoctorByIdService(appointment.assignedGP);
      if (doctorResult.error) {
        console.log('Error fetching doctor:', doctorResult.message);
      }
      return {
        ...appointment._doc,
        clinicName: appointment.clinic?.name || 'Unknown Clinic',
        doctorName: doctorResult.doctor ? `${doctorResult.doctor.firstName} ${doctorResult.doctor.lastName}` : 'Unknown Doctor',
      };
    }));

    return appointmentsWithDoctorNames;
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
      { status: 'Cancelled' },
      { new: true }
    );
    if (!appointment) {
      return { error: true, status: 404, message: 'Appointment not found' };
    }
    const slot = await DoctorAvailability.findOneAndUpdate(
      { _id: appointment.slotId },
      { isBooked: false, bookedBy: null },
      { new: true }
    );
    if (!slot) {
      return { error: true, status: 404, message: 'Slot not found' };
    }
    const user = await User.findOne({ 'appointments.appointmentID': appointmentId });
    if (user) {
      await User.updateOne(
        { 'appointments.appointmentID': appointmentId },
        {
          $set: {
            'appointments.$.status': 'Cancelled'
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

export const getAppointmentsForAUser = async () => {
  try {
    const appointments = await Appointment.find({})
        .populate('clinic')
        .exec();
    if (appointments.length === 0) {
      return { error: true, status: 404, message: 'No appointments found' };
    }
    console.log('Fetched appointments for all users');
    const appointmentsWithDoctorNames = await Promise.all(
        appointments.map(async (appointment) => {
          console.log('Fetching doctor with ID:', appointment.assignedGP);
          const doctorResult = await getDoctorByIdService(appointment.assignedGP);
          if (doctorResult.error) {
            console.log('Error fetching doctor:', doctorResult.message);
          }
          return {
            ...appointment._doc,
            clinicName: appointment.clinic?.name || 'Unknown Clinic',
            doctorName: doctorResult.doctor
                ? `${doctorResult.doctor.firstName} ${doctorResult.doctor.lastName}`
                : 'Unknown Doctor',
          };
        })
    );
    return appointmentsWithDoctorNames;
  } catch (error) {
    console.error('Error fetching appointments for all users:', error);
    throw new Error('Internal server error');
  }
};
