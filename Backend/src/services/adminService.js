import bcrypt from 'bcrypt';
import Admin from '../models/Admin.js';

export const register = async (adminData) => {
    const {
        email,
        password,
        firstName,
        lastName,
        role,
    } = adminData;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) throw new Error('Admin already exists');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = new Admin({
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
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) throw new Error('Admin not found');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error('Invalid credentials');

    return admin;
};

export const readAdmin = async (id) => {
    const admin = await Admin.findById(id).select('-password');
    if (!admin) throw new Error('Admin not found');
    return admin;
};

export const updateAdmin = async (id, updateData) => {
    const admin = await Admin.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
    if (!admin) throw new Error('Admin not found');
    return admin;
};

export const logout = () => {
    return { message: 'Successfully logged out' };
};
