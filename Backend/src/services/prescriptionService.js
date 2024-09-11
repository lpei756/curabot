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
        if (prescriptions && prescriptions.length > 0) {
            return prescriptions;
        } else {
            return 'No prescriptions available';
        }
    } catch (error) {
        console.error('Error in PrescriptionService:', error);
        throw error;
    }
};

export const getUserPrescriptions = async (userId) => {
    try {
        const prescriptions = await Prescription.find({ patient: userId })
            .populate('doctor', '_id name')
            .populate('patient', '_id name');
        if (prescriptions && prescriptions.length > 0) {
            return prescriptions;
        } else {
            return 'No prescriptions found for this user';
        }
    } catch (error) {
        console.error('Error fetching prescriptions for user:', error);
        throw error;
    }
};
