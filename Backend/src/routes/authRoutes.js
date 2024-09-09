import express from 'express';
import { register, login, readUser, updateUser, logout, getGP } from '../controllers/authController.js';
import { sendVerificationCodeController } from '../controllers/verificationController.js';
import schemaValidator from '../middlewares/schemaValidator.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { AUTH_PATHS, buildPathWithBase } from './path.js';

const router = express.Router();

const authPathBase = buildPathWithBase(AUTH_PATHS);

router.post(AUTH_PATHS.sendCode, sendVerificationCodeController);
router.post(AUTH_PATHS.register, schemaValidator(authPathBase.register), register);
router.post(AUTH_PATHS.login, schemaValidator(authPathBase.login), login);
router.get(AUTH_PATHS.user, schemaValidator(authPathBase.user), readUser);
router.put(AUTH_PATHS.updateUser, schemaValidator(authPathBase.updateUser), updateUser);
router.post(AUTH_PATHS.logout, logout);
router.get(AUTH_PATHS.getGP, authenticate, getGP);

export default router;
