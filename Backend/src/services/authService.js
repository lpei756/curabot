import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

export const register = async (userData) => {
    const {
        email,
        password,
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        gender,
        bloodGroup,
        ethnicity,
        address,
        phone,
        emergencyContact,
        medicalHistory,
        insurance,
    } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('User already exists');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
        email,
        password: hashedPassword,
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        gender,
        bloodGroup,
        ethnicity,
        address,
        phone,
        emergencyContact,
        medicalHistory,
        insurance,
    });

    await user.save();
    return user;
};

export const login = async ({ email, password }) => {
    let user = await User.findOne({ email }).select('+password');
    if (!user) {
        user = await Admin.findOne({ email }).select('+password');
    }
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    return user;
};

export const readUser = async (id) => {
    const user = await User.findById(id).select('-password');
    if (!user) throw new Error('User not found');
    return user;
};

export const updateUser = async (id, updateData) => {
    const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password'); // Exclude the password field
    if (!user) throw new Error('User not found');
    return user;
};

export const logout = () => {
    return { message: 'Successfully logged out' };
};
