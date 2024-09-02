import mongoose from 'mongoose';

const clinicLocationsSchema = new mongoose.Schema({
  clinic_name: { type: String, required: true },
  address: { type: String, required: true },
  contact_number: { type: String, required: true },
  latitude: { type: String, required: true },
  longitude: { type: String, required: true }
});

const ClinicLocations = mongoose.model('ClinicLocations', clinicLocationsSchema);

export default ClinicLocations;