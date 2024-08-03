import Clinic from '../models/Clinic.js';

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
