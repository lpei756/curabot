import express from 'express';
import { getDoctorById } from '../controllers/doctorController.js';
import { DOCTOR_PATHS } from './path.js';

const router = express.Router();

router.get(DOCTOR_PATHS.read, getDoctorById);

export default router;
