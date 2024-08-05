import express from 'express';
import { getClinicById } from '../controllers/clinicController.js';
import { CLINIC_PATHS } from './path.js';

const router = express.Router();

// Get a clinic by ID
router.get(CLINIC_PATHS.read, getClinicById);

export default router;