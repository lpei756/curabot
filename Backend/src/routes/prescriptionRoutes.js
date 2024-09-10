import express from 'express';
import { getAllPrescriptions } from '../controllers/prescriptionController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { PRESCRIPTION_PATHS } from './path.js';

const router = express.Router();

router.get(PRESCRIPTION_PATHS.read, authenticate, getAllPrescriptions);

export default router;