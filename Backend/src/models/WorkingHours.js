import mongoose from 'mongoose';

const workingHoursSchema = new mongoose.Schema({
  clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ClinicLocations', required: true },
  day: { type: String, required: true },
  open_time: { type: String, required: true },
  close_time: { type: String, required: true }
});

const WorkingHours = mongoose.model('WorkingHours', workingHoursSchema);

export default WorkingHours;