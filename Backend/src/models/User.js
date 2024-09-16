import mongoose from 'mongoose';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema({
  verificationCode: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
  patientID: { type: String, unique: true },
  nhi: { type: String, unique: true },
  firstName: { type: String, required: true },
  middleName: { type: String, default: '' },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, default: 'Prefer not to say', enum: ['Male', 'Female', 'Non-binary', 'FTM', 'MTF', 'Genderqueer', 'Other', 'Prefer not to say'] },
  bloodGroup: { type: String, default: 'N/A', enum: ['A', 'B', 'AB', 'O', 'N/A'] },
  ethnicity: { type: String, default: 'Other ethnicity', enum: ['European', 'Māori', 'Pacific Peoples', 'Asian', 'MELAA', 'Other ethnicity'] },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relationship: { type: String, default: '' },
  },
  medicalHistory: {
    chronicDiseases: { type: String, default: '' },
    pastSurgeries: { type: String, default: '' },
    familyMedicalHistory: { type: String, default: '' },
    medicationList: { type: String, default: '' },
    allergies: { type: String, default: '' },
  },
  gp: { type: String, default: 'Not assigned' },
  insurance: {
    provider: { type: String, default: '' },
    policyNumber: { type: String, default: '' },
  },
  appointments: [{
    appointmentID: String,
    date: Date,
    status: { type: String, default: 'Scheduled', enum: ['Scheduled', 'Cancelled'] }
  }],
  images: [{ type: String }],
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
  }],
});

UserSchema.pre('save', async function (next) {
  if (this.isNew) {
    this.patientID = crypto.randomInt(100000, 1000000).toString();
    const letters = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 3);
    const numbers = Math.floor(1000 + Math.random() * 9000);
    this.nhi = `${letters}${numbers}`;
  }
  next();
});

const UserModel = mongoose.model('User', UserSchema);
export default UserModel;
