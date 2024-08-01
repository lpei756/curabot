import jwt from 'jsonwebtoken';
import {
  register as registerService,
  login as loginService
} from '../services/authService.js'; // Ensure the correct path and filename

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
    // Login user and get the user object and token
    const { user, token } = await loginService(req.body);
    
    // Respond with user info and token
    res.status(200).json({ user, token });
  } catch (error) {
    // Respond with error message if login fails
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
