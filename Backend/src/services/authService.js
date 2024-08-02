import bcrypt from 'bcrypt';
import User from '../models/User.js';

// Register a new user
export const register = async ({
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
}) => {
  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('User already exists');

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create a new user
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

// Log in a user
export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  // Compare the password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  return user;
};

// Read a user
export const readUser = async (id) => {
    const user = await User.findById(id).select('-password'); // Exclude the password field
    if (!user) throw new Error('User not found');
    return user;
};

// Update a user
export const updateUser = async (id, updateData) => {
    const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password'); // Exclude the password field
    if (!user) throw new Error('User not found');
    return user;
};

// Logout a user
export const logout = () => {
    // Perform logout actions if any (e.g., token blacklist, session destroy, etc.)
    return { message: 'Successfully logged out' };
};

