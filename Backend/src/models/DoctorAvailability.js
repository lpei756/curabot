import mongoose from 'mongoose';

const doctorAvailabilitySchema = new mongoose.Schema({
  doctorID: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: String, required: false }
});

const DoctorAvailability = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);
export default DoctorAvailability;
