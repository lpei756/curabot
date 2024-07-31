const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
  },
  lastName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'non-binary', 'FTM', 'MTF', 'Genderqueer', 'Other', 'Prefer not to say'],
  },
  contactAddress: {
    type: String,
    required: true,
  },
  contactPhone: {
    type: String,
    required: true,
  },
  contactEmail: {
    type: String,
    required: true,
  },
  emergencyContact: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { type: String, required: true },
  },
  medicalHistory: {
    chronicDiseases: { type: String, required: true },
    pastSurgeries: { type: String, required: true },
    familyMedicalHistory: { type: String, required: true },
    medicationList: { type: String, required: true },
    allergies: { type: String, required: true },
  },
  insurance: {
    provider: { type: String, required: true },
    policyNumber: { type: String },
    coverageDetails: { type: String },
  },
  appointments: [
    {
      visitID: String,
      date: Date,
      reasonForVisit: String,
      physicianNotes: String,
      prescriptionsIssued: String,
    },
  ],
  patientID: {
    type: String,
    unique: true,
  },
});

UserSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Generate a unique patient ID
    this.patientID = `PAT${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

module.exports = mongoose.model('User', UserSchema);
