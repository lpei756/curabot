import express from 'express';
import { register, login } from '../controllers/authController.js';
import schemaValidator from '../middlewares/schemaValidator.js';
import { AUTH_PATHS, buildPathWithBase } from './path.js';

const router = express.Router();

const authPathBase = buildPathWithBase(AUTH_PATHS);

router.post(AUTH_PATHS.register, schemaValidator(authPathBase.register), register);

router.post(AUTH_PATHS.login, schemaValidator(authPathBase.login), login);

export default router;
