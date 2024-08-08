import express from 'express';
import { getAllPatients } from '../controllers/patientController.js';
import adminAuthorization from '../middlewares/adminAuthorization.js';
import { ADMIN_PATHS } from './path.js';

const router = express.Router();

// Use the middleware to protect the route
router.get(ADMIN_PATHS.getAllPatients,  adminAuthorization(['doctor', 'nurse']), getAllPatients);

export default router;