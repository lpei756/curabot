import mongoose from 'mongoose';

const PrescriptionSchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medications: { type: String, required: true },
    instructions: { type: String, required: true },
    doctorName: { type: String, required: true },
    patientName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Prescription = mongoose.model('Prescription', PrescriptionSchema);
export default Prescription;
