import { getClinicByIdService } from '../services/clinicService.js';
import { getAllClinics } from '../services/clinicService.js';

export const getClinicById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getClinicByIdService(id);
    if (result.error) {
      return res.status(result.status).json({ message: result.message });
    }
    res.status(200).json(result.clinic);
  } catch (error) {
    console.error('Error fetching clinic:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getClinics = async (req, res) => {
  try {
    const clinics = await getAllClinics();
    res.json(clinics);
  } catch (error) {
    console.error('Error fetching clinics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
