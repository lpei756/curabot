import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import AdminModel from './Admin.js';

const DoctorSchema = new mongoose.Schema({
  doctorID: { type: String, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  languagesSpoken: [{ type: String }],
  specialty: { type: String },
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
  }],
});

DoctorSchema.pre('save', async function (next) {
  const doctor = this;
  if (!doctor.isNew) return next();
  try {
    const count = await mongoose.model('Doctor').countDocuments();
    doctor.doctorID = `D${String(count + 1).padStart(3, '0')}`;
    const salt = await bcrypt.genSalt(10);
    doctor.password = await bcrypt.hash(doctor.password, salt);
    const admin = new AdminModel({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      password: doctor.password,
      role: 'doctor',
      doctor: doctor._id
    });
    await admin.save();

    next();
  } catch (error) {
    next(error);
  }
});

const DoctorModel = mongoose.model('Doctor', DoctorSchema);
export default DoctorModel;
