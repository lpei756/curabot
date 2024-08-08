// controllers/patientController.js
import UserModel from '../models/User.js';

export const getAllPatients = async (req, res) => {
  try {
    const patients = await UserModel.find();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error });
  }
};