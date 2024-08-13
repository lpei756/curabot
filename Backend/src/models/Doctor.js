import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema({
  doctorID: { type: String, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  languagesSpoken: [{ type: String }]
});

const DoctorModel = mongoose.model('Doctor', DoctorSchema);
export default DoctorModel;
