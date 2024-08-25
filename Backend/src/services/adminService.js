import bcrypt from 'bcrypt';
import AdminModel from '../models/Admin.js';
import UserModel from '../models/User.js';

export const register = async (adminData) => {
    const {
        email,
        password,
        firstName,
        lastName,
        role,
    } = adminData;

    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) throw new Error('Admin already exists');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new AdminModel({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
    });

    await admin.save();
    return admin;
};

export const login = async ({ email, password }) => {
    const admin = await AdminModel.findOne({ email }).select('+password');
    if (!admin) throw new Error('Admin not found');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error('Invalid credentials');

    return admin;
};

export const readAdmin = async (adminID) => {
    try {
        const admin = await AdminModel.findOne({ adminID }).select('-password');
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
        console.log('Patients fetched successfully:', patients);
        return patients;
    } catch (error) {
        console.error('Error in getAllPatientsService:', error.message);
        throw new Error('Error fetching all patients');
    }
};
