import mongoose from 'mongoose';

const ClinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  service: { type: String, required: true },
  hours: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  fax: { type: String },
  healthlinkEDI: { type: String },
  email: { type: String, required: true },
  doctors: [{
    firstName: String,
    lastName: String,
    doctorID: String
  }]
});

const ClinicModel = mongoose.model('Clinic', ClinicSchema);
export default ClinicModel;
