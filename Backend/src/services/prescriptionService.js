import Prescription from "../models/Prescription.js";
import Admin from "../models/Admin.js";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

export const generatePrescription = async ({ doctorId, userId, medications, instructions }) => {
    try {
        console.log('Prescription generation request received:', { doctorId, userId, medications, instructions });
        const adminDoctor = await Admin.findOne({ _id: doctorId, role: 'doctor' });
        if (!adminDoctor) {
            throw new Error('Doctor not found in Admin collection');
        }
        console.log('Admin record found:', adminDoctor);
        const doctorDetails = await Doctor.findById(adminDoctor.doctor);
        if (!doctorDetails) {
            throw new Error('Doctor details not found in Doctor collection');
        }
        console.log('Doctor details found:', doctorDetails);
        const patient = await User.findById(userId);
        if (!patient) {
            throw new Error('Patient not found');
        }
        console.log('Patient details found:', patient);
        const prescription = new Prescription({
            doctor: adminDoctor._id,
            patient: patient._id,
            medications,
            instructions,
            doctorName: `${doctorDetails.firstName} ${doctorDetails.lastName}`,
            patientName: `${patient.firstName} ${patient.lastName}`,
        });
        await prescription.save();
        console.log('Prescription generated successfully:', prescription);
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
                .populate('doctor', '_id firstName lastName')
                .populate('patient', '_id firstName lastName');
        } else {
            prescriptions = await Prescription.find({ patient: userId })
                .populate('doctor', '_id firstName lastName')
                .populate('patient', '_id firstName lastName');
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
