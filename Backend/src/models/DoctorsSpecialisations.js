import mongoose from 'mongoose';

const doctorsSpecialisationsSchema = new mongoose.Schema({
  specialisation: { type: String, required: true },
  doctorIDs: { type: [String], required: true }
});

const DoctorsSpecialisations = mongoose.model('DoctorsSpecialisations', doctorsSpecialisationsSchema);

export default DoctorsSpecialisations;