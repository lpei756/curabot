import express from 'express';
import { getDoctorById, getDoctorsByClinic } from '../controllers/doctorController.js';
import { DOCTOR_PATHS } from './path.js';

const router = express.Router();

router.get(DOCTOR_PATHS.read, getDoctorById);

router.get(DOCTOR_PATHS.clinicDoctors, getDoctorsByClinic);

export default router;
