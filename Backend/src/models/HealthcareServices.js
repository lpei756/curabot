import mongoose from 'mongoose';

const healthcareServicesSchema = new mongoose.Schema({
  clinic_name: { type: String, required: true },
  description: { type: String, required: true },
  insurance_coverage: { type: String, required: true },
  health_programs: { type: [String], required: true }
});

const HealthcareServices = mongoose.model('HealthcareServices', healthcareServicesSchema);

export default HealthcareServices;