import Prescription from "../models/Prescription.js";

export const getAllPrescriptions = async (userId, userRole) => {
    try {
        let prescriptions;

        if (userRole === 'doctor') {
            prescriptions = await Prescription.find({ doctor: userId })
                .populate('doctor', '_id name')
                .populate('patient', '_id name');
        } else {
            prescriptions = await Prescription.find({ patient: userId })
                .populate('doctor', '_id name')
                .populate('patient', '_id name');
        }

        return prescriptions;

    } catch (error) {
        console.error('Error in PrescriptionService:', error);
        throw error;
    }
};
