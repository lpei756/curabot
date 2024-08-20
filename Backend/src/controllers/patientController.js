import UserModel from '../models/User.js';

// 获取所有病人信息
export const getAllPatients = async (req, res) => {
  try {
    const patients = await UserModel.find();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error });
  }
};

// 创建新病人
export const createPatient = async (req, res) => {
  try {
    const patient = new UserModel(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 更新病人信息
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPatient = await UserModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json(updatedPatient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 删除病人信息
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPatient = await UserModel.findByIdAndDelete(id);
    if (!deletedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting patient', error });
  }
};
