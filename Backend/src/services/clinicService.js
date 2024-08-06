// services/clinicService.js

import Clinic from '../models/Clinic.js';

export const getClinicByIdService = async (clinicId) => {
  try {
    // Fetch clinic by ID
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