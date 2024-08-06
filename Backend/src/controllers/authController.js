import jwt from 'jsonwebtoken';
import { register as registerService, login as loginService, readUser as readUserService, updateUser as updateUserService, logout as logoutService } from '../services/authService.js';

// Register a new user
export const register = async (req, res) => {
  try {
    // Register user and get the user object
    const user = await registerService(req.body);

    // Generate JWT token using user ID (adjust if using different identifier)
    const token = generateToken(user._id);

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

    const user = await loginService({ email, password });
    if (!user) throw new Error('User not found');

    const token = generateToken(user._id);
    console.log('JWT token generated:', token);

    res.status(200).json({ user, token });
    console.log('Response sent with user data and token');
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(400).json({ message: error.message });
  }
};


// Read an existing user
export const readUser = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Read user request received for ID:', userId);

    const user = await readUserService(userId);
    if (!user) throw new Error('User not found');

    res.status(200).json(user);
    console.log('User data sent:', user);
  } catch (error) {
    console.error('Error during read user:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Update an existing user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const user = await updateUserService(id, updateData);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Logout a user
export const logout = (req, res) => {
  try {
    const response = logoutService();
    res.status(200).json(response);
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
