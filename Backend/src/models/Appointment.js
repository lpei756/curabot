import mongoose from 'mongoose';
import crypto from 'crypto';

const AppointmentSchema = new mongoose.Schema({
  appointmentID: { type: String, unique: true },
  patientID: { type: String, required: true },
  patientName: { type: String, required: true },
  dateTime: { type: Date, required: true },
  typeOfVisit: { type: String, required: true },
  purposeOfVisit: { type: String, required: true },
  assignedGP: { type:String, required: true },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  status: { type: String, default: 'Scheduled' },
  notes: { type: String },
  prescriptionsIssued: { type: String },
});

AppointmentSchema.pre('save', async function (next) {
  if (this.isNew) {
    this.appointmentID = crypto.randomInt(100000, 1000000).toString();
  }
  next();
});

const AppointmentModel = mongoose.model('Appointment', AppointmentSchema);
export default AppointmentModel;

