import express from 'express';

import {register, login, readUser, updateUser, logout} from '../controllers/authController.js';
import schemaValidator from '../middlewares/schemaValidator.js';
import { AUTH_PATHS, buildPathWithBase } from './path.js';


const router = express.Router();

const authPathBase = buildPathWithBase(AUTH_PATHS);

router.post(AUTH_PATHS.register, schemaValidator(authPathBase.register), register);

router.post(AUTH_PATHS.login, schemaValidator(authPathBase.login), login);

// Read route
router.get(AUTH_PATHS.user, schemaValidator(authPathBase.user), readUser);

// Update route
router.put(AUTH_PATHS.updateUser, schemaValidator(authPathBase.updateUser), updateUser);

// Logout route
router.post(AUTH_PATHS.logout, logout);
export default router;
