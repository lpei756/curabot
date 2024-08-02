import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import {
  register as registerService,
  login as loginService
} from '../services/authService.js';

// Register a new user
export const register = async (req, res) => {
  try {
    // Register user and get the user object
    const user = await registerService(req.body);

    // Generate JWT token using user ID (adjust if using different identifier)
    const token = generateToken(user._id); // or user.patientID if that's the correct identifier

    // Respond with user info and token
    res.status(201).json({ user, token });
  } catch (error) {
    // Respond with error message if registration fails
    res.status(400).json({ message: error.message });
  }
};

// Login an existing user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Query the user and include the password field explicitly
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new Error('User not found');

    console.log('User found:', user); // 调试信息

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch); // 调试信息

    if (!isMatch) throw new Error('Invalid credentials');

    // Generate JWT token using user ID
    const token = generateToken(user._id);

    // Respond with user info and token
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Read an existing user
export const readUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user by ID
    const user = await User.findById(id).select('-password'); // Exclude the password field
    if (!user) throw new Error('User not found');

    // Respond with user info
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Utility function to generate JWT
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT secret is not defined');
  }

  return jwt.sign({ user: { _id: userId } }, process.env.JWT_SECRET, {
    expiresIn: '1h' // Token expires in 1 hour
  });
};
