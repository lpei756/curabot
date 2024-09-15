import express from 'express';
import { fetchAllAppointment, fetchAllAppointments, createAppointment, readAppointment, updateAppointment, deleteAppointment } from '../controllers/appointmentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import schemaValidator from '../middlewares/schemaValidator.js';
import { APPOINTMENT_PATHS, buildPathWithBase } from './path.js';

const router = express.Router();

const appointmentPathBase = buildPathWithBase(APPOINTMENT_PATHS);

router.post(APPOINTMENT_PATHS.create, authenticate, schemaValidator(appointmentPathBase.create), createAppointment);
router.get(APPOINTMENT_PATHS.read, authenticate, schemaValidator(appointmentPathBase.read), readAppointment);
router.put(APPOINTMENT_PATHS.update, authenticate, schemaValidator(appointmentPathBase.update), updateAppointment);
router.delete(APPOINTMENT_PATHS.delete, authenticate, deleteAppointment);
router.get(APPOINTMENT_PATHS.all, authenticate, fetchAllAppointments);
router.get(APPOINTMENT_PATHS.userAppointment, authenticate, fetchAllAppointment);

export default router;
