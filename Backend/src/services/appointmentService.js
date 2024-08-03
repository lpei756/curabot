import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Clinic from '../models/Clinic.js';
import User from '../models/User.js';

export const createAppointment = async ({ dateTime, typeOfVisit, purposeOfVisit, clinic, assignedGP, status, notes, prescriptionsIssued, patientID }) => {
  try {
    // Validate patient ID
    if (!patientID) {
      return { error: true, status: 400, message: 'Patient ID is required' };
    }

    // Fetch user to get their name
    const user = await User.findOne({ patientID });
    if (!user) {
      return { error: true, status: 404, message: 'User not found' };
    }

    // Validate clinic existence
    const clinicData = await Clinic.findById(clinic);
    if (!clinicData) {
      return { error: true, status: 404, message: 'Clinic not found' };
    }

    // Check if doctor exists in the selected clinic
    const doctor = await Doctor.findOne({ doctorID: assignedGP, clinic });
    if (!doctor) {
      return { error: true, status: 404, message: 'Doctor not found for the selected clinic' };
    }

    // Create and save appointment
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
      patientName: `${user.firstName} ${user.lastName}`
    });

    await newAppointment.save();
    return { error: false, appointment: newAppointment };
  } catch (error) {
    console.error('Error creating appointment in service:', error);
    return { error: true, status: 500, message: 'Internal server error' };
  }
};