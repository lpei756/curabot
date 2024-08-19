import mongoose from 'mongoose';

const doctorAvailabilitySchema = new mongoose.Schema({
  doctorID: {
    type: String,
    required: true,
    unique: true,
    ref: 'Doctor'
  },
  date: {
    type: Date,
    required: true
  },
  slots: [
    {
      startTime: {
        type: Date,
        required: true
      },
      endTime: {
        type: Date,
        required: true
      },
      isBooked: {
        type: Boolean,
        default: false
      },
      bookedBy: {
        type: String,
        ref: 'Patient',
        default: null
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

doctorAvailabilitySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const DoctorAvailability = mongoose.model('DoctorAvailability', doctorAvailabilitySchema);
export default DoctorAvailability;
