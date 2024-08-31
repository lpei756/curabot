import bcrypt from 'bcrypt';
import AdminModel from '../models/Admin.js';
import UserModel from '../models/User.js';
import DoctorModel from '../models/Doctor.js';
import mongoose from 'mongoose';

export const register = async (adminData) => {
    const { email, password, firstName, lastName, role, clinic, languagesSpoken, specialty } = adminData;

    console.log('Starting registration process with data:', { email, firstName, lastName, role, clinic, languagesSpoken, specialty });

    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) {
        console.error('Admin already exists with email:', email);
        throw new Error('Admin already exists');
    }

    const admin = new AdminModel({
        email,
        password,
        firstName,
        lastName,
        role,
    });

    if (role === 'doctor') {
        const doctor = new DoctorModel({
            firstName,
            lastName,
            email,
            password,
            clinic,
            languagesSpoken,
            specialty,
        });
        await doctor.save();
        admin.doctor = doctor._id;
    }

    console.log('Saving new admin to the database:', admin);
    await admin.save();

    console.log('Admin registered successfully:', admin);
    return admin;
};

export const login = async ({ email, password }) => {
    const admin = await AdminModel.findOne({ email }).select('+password');
    if (!admin) throw new Error('Admin not found');

    console.log('Admin password from DB:', admin.password);
    console.log('Password from request:', password);

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        console.error('Password does not match for email:', email);
        throw new Error('Invalid credentials');
    }

    return admin;
};

export const readAdmin = async (adminID) => {
    try {
        const admin = await AdminModel.findById(adminID).select('-password');
        if (!admin) {
            throw new Error('Admin not found');
        }
        return admin;
    } catch (error) {
        console.error('Error in readAdminService:', error.message);
        throw error;
    }
};
export const updateAdmin = async (id, updateData) => {
    const admin = await AdminModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
    if (!admin) throw new Error('Admin not found');
    return admin;
};

export const deleteAdmin = async (id) => {
    try {
        console.log(`Attempting to delete admin with ID: ${id}`);
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid ID format');
        }
        const admin = await AdminModel.findById(id);
        if (!admin) {
            throw new Error('Admin not found');
        }
        if (admin.role === 'doctor' && admin.doctor) {
            const doctor = await DoctorModel.findByIdAndDelete(admin.doctor);
            if (doctor) {
                console.log(`Doctor with ID ${admin.doctor} was deleted successfully`);
            }
        }
        await AdminModel.findByIdAndDelete(id);
        console.log(`Admin with ID: ${id} was deleted successfully`);
        return admin;
    } catch (error) {
        console.error(`Error deleting admin with ID: ${id}`, error.message);
        throw new Error('Error deleting admin: ' + error.message);
    }
};


export const logout = () => {
    return { message: 'Successfully logged out' };
};

export const getAllAdmins = async () => {
    try {
        console.log('Starting to fetch all admins from the database...');
        const admins = await AdminModel.find().select('-password');
        console.log('Admins fetched successfully:', admins);
        return admins;
    } catch (error) {
        console.error('Error in getAllAdminsService:', error.message);
        throw new Error('Error fetching all admins');
    }
};

export const getAllPatients = async () => {
    try {
        console.log('Starting to fetch all patients from the database...');
        const patients = await UserModel.find();
        console.log('Patients fetched successfully！');
        return patients;
    } catch (error) {
        console.error('Error in getAllPatientsService:', error.message);
        throw new Error('Error fetching all patients');
    }
};
export const readPatient = async (patientID) => {
    try {
        const user = await UserModel.findById(patientID).select('-password');
        if (!user) throw new Error('User not found');
        return user;
    } catch (error) {
        console.error('Error in readPatientService:', error.message);
        throw error;
    }
};

export const updatePatient = async (id, updateData) => {
    const user = await UserModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
    if (!user) throw new Error('User not found');
    return user;
};

export const fetchDoctors = async () => {
    try {
        const doctors = await AdminModel.find({ role: 'doctor' });
        return doctors;
    } catch (error) {
        throw new Error('Error fetching doctors: ' + error.message);
    }
};
