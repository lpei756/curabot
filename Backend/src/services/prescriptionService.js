import Prescription from "../models/Prescription.js";
import Admin from "../models/Admin.js";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

export const generatePrescription = async ({ doctorId, userId, medications, instructions }) => {
    try {
        const adminDoctor = await Admin.findOne({ _id: doctorId, role: 'doctor' });
        if (!adminDoctor) {
            throw new Error('Doctor not found in Admin collection');
        }
        const doctorDetails = await Doctor.findById(adminDoctor.doctor);
        if (!doctorDetails) {
            throw new Error('Doctor details not found in Doctor collection');
        }
        const patient = await User.findById(userId);
        if (!patient) {
            throw new Error('Patient not found');
        }
        const prescription = new Prescription({
            doctor: adminDoctor._id,
            patient: patient._id,
            medications,
            instructions,
            doctorName: `${doctorDetails.firstName} ${doctorDetails.lastName}`,
            patientName: `${patient.firstName} ${patient.lastName}`,
        });
        await prescription.save();
        return prescription;
    } catch (error) {
        console.error('Error in generatePrescriptionService:', error.message);
        throw new Error(`Error generating prescription: ${error.message}`);
    }
};

export const getAllPrescriptions = async (userId, userRole) => {
    try {
        let prescriptions;
        if (userRole === 'doctor') {
            prescriptions = await Prescription.find({ doctor: userId })
                .populate({
                    path: 'doctor',
                    model: 'Admin',
                    populate: {
                        path: 'doctor',
                        model: 'Doctor',
                        select: '_id firstName lastName'
                    },
                    select: '_id firstName lastName'
                })
                .populate('patient', '_id firstName lastName');
        } else {
            prescriptions = await Prescription.find({ patient: userId })
                .populate({
                    path: 'doctor',
                    model: 'Admin',
                    populate: {
                        path: 'doctor',
                        model: 'Doctor',
                        select: '_id firstName lastName'
                    },
                    select: '_id firstName lastName'
                })
                .populate('patient', '_id firstName lastName');
        }
        if (prescriptions && prescriptions.length > 0) {
            return prescriptions;
        } else {
            return 'No prescriptions available';
        }
    } catch (error) {
        throw error;
    }
};

export const getUserPrescriptions = async (userId) => {
    try {
        const prescriptions = await Prescription.find({ patient: userId })
            .populate({
                path: 'doctor',
                model: 'Admin',
                populate: {
                    path: 'doctor',
                    model: 'Doctor',
                    select: '_id firstName lastName'
                },
                select: '_id firstName lastName'
            })
            .populate('patient', '_id firstName lastName');

        if (prescriptions && prescriptions.length > 0) {
            return prescriptions;
        } else {
            return 'No prescriptions found for this user';
        }
    } catch (error) {
        console.error('Error fetching user prescriptions:', error);
        throw error;
    }
};

export const repeatPrescription = async ({ doctorId, userId, prescriptionId }) => {
    try {
        const existingPrescription = await Prescription.findById(prescriptionId);
        if (!existingPrescription) {
            throw new Error('Original prescription not found');
        }
        const adminDoctor = await Admin.findOne({ _id: doctorId, role: 'doctor' });
        if (!adminDoctor) {
            throw new Error('Doctor not found in Admin collection');
        }
        const doctorDetails = await Doctor.findById(adminDoctor.doctor);
        if (!doctorDetails) {
            throw new Error('Doctor details not found in Doctor collection');
        }
        const patient = await User.findById(userId);
        if (!patient) {
            throw new Error('Patient not found');
        }
        const prescription = new Prescription({
            doctor: adminDoctor._id,
            patient: patient._id,
            medications: existingPrescription.medications,
            instructions: existingPrescription.instructions,
            doctorName: `${doctorDetails.firstName} ${doctorDetails.lastName}`,
            patientName: `${patient.firstName} ${patient.lastName}`,
        });
        await prescription.save();
        return prescription;
    } catch (error) {
        console.error('Error in repeatPrescriptionService:', error.message);
        throw new Error(`Error generating repeat prescription: ${error.message}`);
    }
};
