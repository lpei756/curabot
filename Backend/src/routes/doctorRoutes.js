import express from 'express';
import { getDoctorById } from '../controllers/doctorController.js';
import { DOCTOR_PATHS } from './path.js';

const router = express.Router();

// Get a doctor by ID
router.get(DOCTOR_PATHS.read, getDoctorById);

export default router;


