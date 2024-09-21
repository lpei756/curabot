import mongoose from 'mongoose';
import Clinic from '../models/Clinic.js';
import { getDoctorByIdService } from '../services/doctorService.js';

export const getDoctorsByClinic = async (req, res) => {
  const { clinicId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(clinicId)) {
    return res.status(400).json({ error: 'Invalid clinic ID format' });
  }
  try {
    const clinic = await Clinic.findById(clinicId);

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    if (!clinic.doctors || clinic.doctors.length === 0) {
      return res.status(404).json({ error: 'No doctors found for this clinic' });
    }

    res.json(clinic.doctors);
  } catch (error) {
    console.error('Error fetching doctors by clinic:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDoctorById = async (req, res) => {
  const { doctorID } = req.params;

  if (!doctorID) {
    return res.status(400).json({ message: 'Doctor ID is required' });
  }

  try {
    const result = await getDoctorByIdService(doctorID);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json(result.doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
