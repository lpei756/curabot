import jwt from 'jsonwebtoken';
import { register as registerService, login as loginService, readUser as readUserService, updateUser as updateUserService, logout as logoutService } from '../services/authService.js';

export const register = async (req, res) => {
  try {
    const user = await registerService(req.body);

    const token = generateToken(user._id);

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await loginService({ email, password });
    if (!user) throw new Error('User not found');

    const token = generateToken(user._id, user.role);
    console.log('JWT token generated:', token);

    res.status(200).json({ user, token });
    console.log('Response sent with user data and token');
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(400).json({ message: error.message });
  }
};

export const readUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await readUserService(id);
    if (!user) {
      console.log('User not found for ID:', id);
      throw new Error('User not found');
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(404).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching user with ID:', id);
    const updateData = req.body;
    const user = await updateUserService(id, updateData);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  try {
    const response = logoutService();
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const generateToken = (userId, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT secret is not defined');
  }

  return jwt.sign({ user: { _id: userId, role } }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

export const doctorRegister = async (req, res) => {
  try {
    const { email, password, ...otherData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const doctor = new DoctorModel({ email, password: hashedPassword, ...otherData });
    await doctor.save();

    const token = generateToken(doctor._id, 'doctor');

    res.status(201).json({ doctor, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await DoctorModel.findOne({ email });

    if (!doctor || !(await bcrypt.compare(password, doctor.password))) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(doctor._id, 'doctor');
    res.status(200).json({ doctor, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
