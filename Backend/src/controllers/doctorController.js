import Clinic from '../models/Clinic.js';
import { getDoctorByIdService } from '../services/doctorService.js';
export const getDoctorsByClinic = async (req, res) => {
  const { clinicId } = req.params;
  try {
    const clinic = await Clinic.findById(clinicId).populate('doctors', 'firstName lastName'); // Populate doctors
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

    res.json(clinic.doctors);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getDoctorByIdService(id);

    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json(result.doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
