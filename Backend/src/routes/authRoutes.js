import express from 'express';
import {register, login, readUser} from '../controllers/authController.js'; // Ensure the correct path and filename
import schemaValidator from '../middlewares/schemaValidator.js'; // Ensure the correct path and filename
import { AUTH_PATHS, buildPathWithBase } from './path.js'; // Ensure the correct path and filename

// Create a new router
const router = express.Router();

// Build the auth path base
const authPathBase = buildPathWithBase(AUTH_PATHS);

// Register and login routes
router.post(AUTH_PATHS.register, schemaValidator(authPathBase.register), register);

// Login route
router.post(AUTH_PATHS.login, schemaValidator(authPathBase.login), login);

// Read route
router.get(AUTH_PATHS.user, schemaValidator(authPathBase.user), readUser);
export default router;
