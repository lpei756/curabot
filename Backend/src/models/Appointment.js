const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  AppointmentID: { type: String, required: true },
  PatientID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  PatientName: String,
  DateTime: { type: Date, required: true },
  TypeOfVisit: String,
  PurposeOfVisit: String,
  AssignedGP: String,
  Location: String,
  Status: String,
  Notes: String,
  PrescriptionsIssued: String
});

module.exports = mongoose.model('Appointment', appointmentSchema);
