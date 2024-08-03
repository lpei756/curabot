import Clinic from '../models/Clinic.js';

export const getClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find().select('name');
    res.json(clinics);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
