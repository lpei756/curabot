import Doctor from '../models/Doctor.js';

export const getDoctorByIdService = async (doctorId) => {
  try {
    const doctor = await Doctor.findOne({ doctorID: doctorId });

    if (!doctor) {
      return { error: true, status: 404, message: 'Doctor not found' };
    }

    return { error: false, doctor };
  } catch (error) {
    console.error('Error fetching doctor in service:', error);
    return { error: true, status: 500, message: 'Internal server error' };
  }
};
