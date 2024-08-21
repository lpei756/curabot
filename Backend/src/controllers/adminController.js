import jwt from 'jsonwebtoken';
import { register as registerAdminService, login as loginAdminService, readAdmin as readAdminService, updateAdmin as updateAdminService, logout as logoutAdminService } from '../services/adminService.js';

export const adminRegister = async (req, res) => {
    try {
        console.log('Received request for admin registration:', req.body);
        const admin = await registerAdminService(req.body);

        console.log('Admin registered successfully:', admin);
        const token = generateToken(admin._id, 'admin');

        console.log('JWT token generated for admin:', token);
        res.status(201).json({ admin, token });
    } catch (error) {
        console.error('Error during admin registration:', error.message);
        res.status(400).json({ message: error.message });
    }
};

export const adminLogin = async (req, res) => {
    try {
        console.log('Received login request with email:', req.body.email);
        const { email, password } = req.body;

        const admin = await loginAdminService({ email, password });
        if (!admin) {
            console.error('Admin not found with email:', email);
            throw new Error('Admin not found');
        }

        const token = generateToken(admin._id, 'admin');
        console.log('JWT token generated:', token);

        res.status(200).json({ admin, token });
        console.log('Response sent with admin data and token');
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
            throw new Error('Admin not found');
        }

        console.log('Admin data retrieved:', admin);
        res.status(200).json({ admin });
    } catch (error) {
        console.error('Error fetching admin:', error.message);
        res.status(404).json({ message: error.message });
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

// 获取所有管理员
export const getAllAdmins = async (req, res) => {
    try {
        console.log('Received request to fetch all admins');
        const admins = await getAllAdminsService();
        console.log('All admins retrieved successfully:', admins);
        res.status(200).json(admins);
    } catch (error) {
        console.error('Error fetching all admins:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// 获取所有患者
export const getAllPatients = async (req, res) => {
    try {
        console.log('Received request to fetch all patients');
        const patients = await getAllPatientsService();
        console.log('All patients retrieved successfully:', patients);
        res.status(200).json(patients);
    } catch (error) {
        console.error('Error fetching all patients:', error.message);
        res.status(500).json({ message: error.message });
    }
};

const generateToken = (adminId, role) => {
    console.log('Generating JWT token for admin with ID:', adminId, 'and role:', role);
    if (!process.env.JWT_SECRET) {
        console.error('JWT secret is not defined');
        throw new Error('JWT secret is not defined');
    }

    const token = jwt.sign({ user: { _id: adminId, role } }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });

    console.log('JWT token generated:', token);
    return token;
};
