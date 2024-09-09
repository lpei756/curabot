import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Doctor from '../models/Doctor.js';
import { verifyCodeAndRegister } from './verificationService.js';

export const register = async (userData) => {
  return await verifyCodeAndRegister(userData);
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

export const getUserGP = async (id) => {
    try {
      console.log("Fetching user with ID:", id);
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid userId');
      }
      const user = await User.findById(id);

      if (!user) {
        throw new Error('User not found');
      }

      console.log("User found:", user);

      const gp = await Doctor.findOne({ doctorID: user.gp });

      if (!gp) {
        throw new Error('GP not found');
      }

      return gp;
    } catch (error) {
      console.error('Error fetching GP from service:', error);
      throw error;
    }
  };
