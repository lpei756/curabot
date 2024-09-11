import express from 'express';
import { generatePrescription, getAllPrescriptions, getUserPrescriptions } from '../controllers/prescriptionController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import {NOTIFICATION_PATHS, PRESCRIPTION_PATHS} from './path.js';
import {deleteNotification} from "../controllers/notificationController.js";

const router = express.Router();

router.delete(NOTIFICATION_PATHS.delete, authenticate, deleteNotification);
router.post(PRESCRIPTION_PATHS.generatePrescription, authenticate, generatePrescription);
router.get(PRESCRIPTION_PATHS.read, authenticate, getAllPrescriptions);
router.get(PRESCRIPTION_PATHS.getUserPrescriptions, authenticate, getUserPrescriptions);

export default router;
