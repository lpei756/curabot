import express from 'express';
import { getDoctorById, getDoctorsByClinic } from '../controllers/doctorController.js';
import { doctorRegister, doctorLogin } from '../controllers/authController.js';
import { DOCTOR_PATHS } from './path.js';

const router = express.Router();

router.get(DOCTOR_PATHS.read, getDoctorById);

router.get(DOCTOR_PATHS.clinicDoctors, getDoctorsByClinic);

router.post(DOCTOR_PATHS.doctorRegister, doctorRegister);

router.post(DOCTOR_PATHS.doctorLogin, doctorLogin);

export default router;
