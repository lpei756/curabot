import mongoose from 'mongoose';

const Admin = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['doctor', 'nurse'], required: true }
});

const AdminModel = mongoose.model('Admin', Admin);
export default AdminModel;
