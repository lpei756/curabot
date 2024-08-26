import jwt from 'jsonwebtoken';
import {
    register as registerAdminService,
    login as loginAdminService,
    readAdmin as readAdminService,
    updateAdmin as updateAdminService,
    logout as logoutAdminService,
    getAllAdmins as getAllAdminsService,
    getAllPatients as getAllPatientsService,
    updatePatient as updatePatientService
} from '../services/adminService.js';
import bcrypt from 'bcrypt';
import {updateUser as updateUserService} from "../services/authService.js";

export const adminRegister = async (req, res) => {
    try {
        console.log('Received request for admin registration:', req.body);

        const admin = await registerAdminService(req.body);
        console.log('Admin object returned from registerAdminService:', admin);

        const token = generateToken(admin._id, admin.role);
        console.log('JWT token generated for admin:', token);

        res.status(201).json({ admin, token });
    } catch (error) {
        console.error('Error during admin registration:', error.message);
        res.status(400).json({ message: error.message });
    }
};

export const adminLogin = async (req, res) => {
    try {
        console.log('Received login request with body:', req.body);

        const { email, password } = req.body;
        console.log('Extracted email:', email);
        console.log('Extracted password:', password);

        if (!email || !password) {
            console.error('Email or password is missing in the request body');
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const admin = await loginAdminService({ email, password }); // 确保这里传递了password
        if (!admin) {
            console.error('Admin not found with email:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            console.error('Password does not match for email:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(admin._id, admin.role);
        console.log('JWT token generated:', token);

        res.status(200).json({ admin, token });
    } catch (error) {
        console.error('Error during admin login:', error.message);
        res.status(400).json({ message: error.message });
    }
};

export const readAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching admin with ID:', id);
        const admin = await readAdminService(id);
        if (!admin) {
            console.error('Admin not found for ID:', id);
            return res.status(404).json({ message: 'Admin not found' });
        }

        console.log('Admin data retrieved:', admin);
        res.status(200).json({ admin });
    } catch (error) {
        console.error('Error fetching admin:', error.message);
        res.status(404).json({ message: error.message });
    }
};



export const logout = (req, res) => {
    try {
        console.log('Admin logout request received.');
        const response = logoutAdminService();
        console.log('Admin logged out successfully:', response);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error during admin logout:', error.message);
        res.status(400).json({ message: error.message });
    }
};

// 查找管理员
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await getAllAdminsService();
        res.status(200).json({ admins });
    } catch (error) {
        console.error('Error fetching all admins:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllPatients = async (req, res) => {
    try {
        const patients = await getAllPatientsService();
        res.status(200).json({ patients });
    } catch (error) {
        console.error('Error fetching all patients:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};
export const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching patient with ID:', id);
        const updateData = req.body;
        const user = await updatePatientService(id, updateData);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Received request to update admin with ID:', id);
        const updateData = req.body;
        console.log('Update data:', updateData);
        const admin = await updateAdminService(id, updateData);
        console.log('Admin updated successfully:', admin);
        res.status(200).json(admin);
    } catch (error) {
        console.error('Error updating admin:', error.message);
        res.status(400).json({ message: error.message });
    }
};

const generateToken = (adminId, role) => {
    console.log('Generating JWT token for admin with ID:', adminId, 'and role:', role);
    if (!process.env.JWT_SECRET) {
        console.error('JWT secret is not defined');
        throw new Error('JWT secret is not defined');
    }

    const token = jwt.sign({ user: { _id: adminId, role } }, process.env.JWT_SECRET, {
        expiresIn: '12h',
    });

    console.log('JWT token generated:', token);
    return token;
};
