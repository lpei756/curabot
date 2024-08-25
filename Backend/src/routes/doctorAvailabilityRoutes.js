import express from 'express';
import {
  setDoctorAvailability,
  getDoctorAvailability,
  updateDoctorAvailability,
  deleteDoctorAvailability,
  getAvailabilityByDate,
  getDoctorAvailabilityByAddress,
  getAvailableSlots
} from '../controllers/doctorAvailabilityController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import adminAuthorization from '../middlewares/adminAuthorization.js';
import schemaValidator from '../middlewares/schemaValidator.js';
import { DOCTOR_AVAILABILITY_PATHS, buildPathWithBase } from './path.js';

const router = express.Router();

const doctorAvailabilityPathBase = buildPathWithBase(DOCTOR_AVAILABILITY_PATHS);

router.post(DOCTOR_AVAILABILITY_PATHS.set, authenticate, adminAuthorization(['doctor', 'nurse']), schemaValidator(doctorAvailabilityPathBase.set), setDoctorAvailability);
router.get(DOCTOR_AVAILABILITY_PATHS.getByDoctor, authenticate, schemaValidator(doctorAvailabilityPathBase.getByDoctor), getDoctorAvailability);
router.get(DOCTOR_AVAILABILITY_PATHS.getByDate, authenticate, schemaValidator(doctorAvailabilityPathBase.getByDate), getAvailabilityByDate);
router.get(DOCTOR_AVAILABILITY_PATHS.getByAddress, authenticate, schemaValidator(doctorAvailabilityPathBase.getByAddress), getDoctorAvailabilityByAddress);
router.get(DOCTOR_AVAILABILITY_PATHS.getAll, authenticate, getAvailableSlots);
router.put(DOCTOR_AVAILABILITY_PATHS.update, authenticate, adminAuthorization(['doctor', 'nurse']), schemaValidator(doctorAvailabilityPathBase.update), updateDoctorAvailability);
router.delete(DOCTOR_AVAILABILITY_PATHS.delete, authenticate, adminAuthorization(['doctor', 'nurse']), deleteDoctorAvailability);

export default router;
