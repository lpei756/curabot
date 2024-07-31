const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: { type: String, default: '' },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'non-binary', 'FTM', 'MTF', 'Genderqueer', 'Other', 'Prefer not to say'], required: true },
  contactAddress: { type: String, required: true },
  contactPhone: { type: String, required: true },
  contactEmail: { type: String, required: true, unique: true },
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
  insurance: {
    provider: { type: String, required: true, enum: ['No', 'Other'] },
    policyNumber: { type: String, default: '' },
    coverageDetails: { type: String, default: '' },
  },
  appointments: [{
    visitID: { type: String, default: '' },
    date: { type: Date, default: null },
    reasonForVisit: { type: String, default: '' },
    physicianNotes: { type: String, default: '' },
    prescriptionsIssued: { type: String, default: '' },
  }],
});

UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
