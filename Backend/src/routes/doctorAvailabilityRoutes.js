import express from 'express';
import {
  setDoctorAvailability,
  getDoctorAvailability
} from '../controllers/doctorAvailabilityController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import adminAuthorization from '../middlewares/adminAuthorization.js';
import schemaValidator from '../middlewares/schemaValidator.js';
import { DOCTOR_AVAILABILITY_PATHS, buildPathWithBase } from './path.js';

const router = express.Router();

const doctorAvailabilityPathBase = buildPathWithBase(DOCTOR_AVAILABILITY_PATHS);

router.post(
  DOCTOR_AVAILABILITY_PATHS.set,
  authenticate,
  adminAuthorization(['doctor', 'nurse']),
  schemaValidator(doctorAvailabilityPathBase.set),
  setDoctorAvailability
);

router.get(
  DOCTOR_AVAILABILITY_PATHS.get,
  authenticate,
  schemaValidator(doctorAvailabilityPathBase.get),
  getDoctorAvailability
);

export default router;
