import Clinic from '../models/Clinic.js';

export const getClinicByIdService = async (clinicId) => {
  try {
    const clinic = await Clinic.findById(clinicId);

    if (!clinic) {
      return { error: true, status: 404, message: 'Clinic not found' };
    }

    return { error: false, clinic };
  } catch (error) {
    console.error('Error fetching clinic in service:', error);
    return { error: true, status: 500, message: 'Internal server error' };
  }
};

export const getAllClinics = async () => {
  try {
    const clinics = await Clinic.find({}).populate('doctors');
    return clinics;
  } catch (error) {
    console.error('Error fetching clinics:', error);
    throw new Error('Error fetching clinics');
  }
};
