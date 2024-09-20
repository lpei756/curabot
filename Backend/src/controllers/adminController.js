import jwt from 'jsonwebtoken';
import {
    register as registerAdminService,
    login as loginAdminService,
    me as meService,
    readAdmin as readAdminService,
    updateAdmin as updateAdminService,
    deleteAdmin as deleteAdminService,
    logout as logoutAdminService,
    getAllAdmins as getAllAdminsService,
    getAllPatients as getAllPatientsService,
    readPatient as readPatientService,
    updatePatient as updatePatientService,
    fetchDoctors as fetchDoctorsService,
    getUserByPatientIdService
} from '../services/adminService.js';
import bcrypt from 'bcrypt';

export const adminRegister = async (req, res) => {
    try {
        const admin = await registerAdminService(req.body);

        if (!admin) {
            throw { status: 500, message: 'Admin registration failed' };
        }

        const token = generateToken(admin._id, admin.role);
        res.status(201).json({ admin, token });
    } catch (error) {
        console.error('Error during admin registration:', error.message);
        const status = error.status || 400;
        res.status(status).json({ message: error.message, details: error.details || 'Validation failed' });
    }
};

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            console.error('Email or password is missing in the request body');
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const admin = await loginAdminService({ email, password });
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
        res.status(200).json({ admin, token });
    } catch (error) {
        console.error('Error during admin login:', error.message);
        res.status(400).json({ message: error.message });
    }
};

export const me = async (req, res) => {
    try {
        const adminId = req.admin._id;
        const admin = await meService(adminId);
        if (!admin) {
            console.error('Admin not found for ID:', adminId);
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json({ admin });
    } catch (error) {
        console.error('Error fetching admin:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

export const readAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await readAdminService(id);
        if (!admin) {
            console.error('Admin not found for ID:', id);
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json({ admin });
    } catch (error) {
        console.error('Error fetching admin:', error.message);
        res.status(404).json({ message: error.message });
    }
};

export const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const admin = await updateAdminService(id, updateData);
        res.status(200).json(admin);
    } catch (error) {
        console.error('Error updating admin:', error.message);
        res.status(400).json({ message: error.message });
    }
};

export const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await deleteAdminService(id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error(`Error deleting admin with ID: ${req.params.id}`, error.message);
        res.status(400).json({ message: error.message });
    }
};

export const logout = (req, res) => {
    try {
        const response = logoutAdminService();
        res.status(200).json(response);
    } catch (error) {
        console.error('Error during admin logout:', error.message);
        res.status(400).json({ message: error.message });
    }
};

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

export const getUserByPatientId = async (req, res) => {
    try {
        const { patientID } = req.params;
        const { error, user, message, status } = await getUserByPatientIdService(patientID);
        if (error) {
            return res.status(status || 500).json({ message });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const user = await updatePatientService(id, updateData);
        res.status(200).json(user);
    } catch (error) {
        console.error('Error updating patient:', error.message);
        res.status(400).json({ message: error.message });
    }
};

export const readPatient = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await readPatientService(id);
        if (!user) {
            console.error('Patient not found for ID:', id);
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching patient:', error.message);
        res.status(404).json({ message: error.message });
    }
};

export const getDoctors = async (req, res) => {
    try {
        const doctors = await fetchDoctorsService();
        res.status(200).json({ doctors });
    } catch (error) {
        console.error('Error fetching doctors:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const generateToken = (adminId, role) => {
    if (!process.env.JWT_SECRET) {
        console.error('JWT secret is not defined');
        throw new Error('JWT secret is not defined');
    }
    const token = jwt.sign({ user: { _id: adminId, role } }, process.env.JWT_SECRET, {
        expiresIn: '12h',
    });
    return token;
};
