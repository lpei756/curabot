import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const AdminSchema = new mongoose.Schema({
  adminID: { type: String, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['superadmin', 'doctor', 'nurse'],
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

AdminSchema.pre('save', async function (next) {
  if (this.isNew) {
    this.adminID = crypto.randomInt(100000, 1000000).toString();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const AdminModel = mongoose.model('Admin', AdminSchema);
export default AdminModel;
