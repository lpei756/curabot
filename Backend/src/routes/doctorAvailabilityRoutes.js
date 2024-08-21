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
console.log('Doctor availability set path:', DOCTOR_AVAILABILITY_PATHS.set);
router.get(DOCTOR_AVAILABILITY_PATHS.getByDoctor, authenticate, schemaValidator(doctorAvailabilityPathBase.getByDoctor), getDoctorAvailability);
console.log('Get Doctor availability path:', DOCTOR_AVAILABILITY_PATHS.getByDoctor);
router.get(DOCTOR_AVAILABILITY_PATHS.getByDate, authenticate, schemaValidator(doctorAvailabilityPathBase.getByDate), getAvailabilityByDate);
console.log('Get Doctor availability by date path:', DOCTOR_AVAILABILITY_PATHS.getByDate);
router.get(DOCTOR_AVAILABILITY_PATHS.getByAddress, authenticate, schemaValidator(doctorAvailabilityPathBase.getByAddress), getDoctorAvailabilityByAddress);
console.log('Get Doctor availability by address path:', DOCTOR_AVAILABILITY_PATHS.getByAddress);
router.get(DOCTOR_AVAILABILITY_PATHS.getAll, authenticate, getAvailableSlots);
console.log('Get all Doctor availability path:', DOCTOR_AVAILABILITY_PATHS.getAll);
router.put(DOCTOR_AVAILABILITY_PATHS.update, authenticate, adminAuthorization(['doctor', 'nurse']), schemaValidator(doctorAvailabilityPathBase.update), updateDoctorAvailability);
console.log('Update Doctor availability path:', DOCTOR_AVAILABILITY_PATHS.update);
router.delete(DOCTOR_AVAILABILITY_PATHS.delete, authenticate, adminAuthorization(['doctor', 'nurse']), deleteDoctorAvailability);
console.log('Delete Doctor availability path:', DOCTOR_AVAILABILITY_PATHS.delete);
export default router;
