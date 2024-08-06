import mongoose from 'mongoose';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema({
  patientID: { type: String, unique: true },
  nhi: { type: String, unique: true },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Non-binary', 'FTM', 'MTF', 'Genderqueer', 'Other', 'Prefer not to say'] },
  bloodGroup: { type: String, required: true, enum: ['A', 'B', 'AB', 'O', 'N', 'A'] },
  ethnicity: { type: String, required: true, enum: ['European', 'Māori', 'Pacific Peoples', 'Asian', 'MELAA', 'Other ethnicity'] },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  emergencyContact: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { type: String, required: true },
  },
  medicalHistory: {
    chronicDiseases: { type: String, required: true, enum: ['No', 'Other'] },
    pastSurgeries: { type: String, required: true, enum: ['No', 'Other'] },
    familyMedicalHistory: { type: String, required: true, enum: ['No', 'Other'] },
    medicationList: { type: String, required: true, enum: ['No', 'Other'] },
    allergies: { type: String, required: true, enum: ['No', 'Other'] },
  },
  gp: { type: String, default: 'Not assigned' },
  insurance: {
    provider: { type: String, required: true, enum: ['No', 'Other'] },
    policyNumber: { type: String },
  },
  appointments: [
    { appointmentID: String, date: Date },
  ],
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
