import express from 'express';
import { getClinicById, getClinics } from '../controllers/clinicController.js';
import { CLINIC_PATHS } from './path.js';
import { getDoctorsByClinic } from '../controllers/doctorController.js';

const router = express.Router();

router.get(CLINIC_PATHS.read, getClinicById);
router.get(CLINIC_PATHS.all, getClinics);
router.get(CLINIC_PATHS.doctor, getDoctorsByClinic);

export default router;
