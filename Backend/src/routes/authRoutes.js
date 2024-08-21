import express from 'express';
import { register, login, readUser, updateUser, logout, getGP } from '../controllers/authController.js';
import schemaValidator from '../middlewares/schemaValidator.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { AUTH_PATHS, buildPathWithBase } from './path.js';

const router = express.Router();

const authPathBase = buildPathWithBase(AUTH_PATHS);

router.post(AUTH_PATHS.register, schemaValidator(authPathBase.register), register);
console.log('User register path:', AUTH_PATHS.register);
router.post(AUTH_PATHS.login, schemaValidator(authPathBase.login), login);
console.log('User login path:', AUTH_PATHS.login);
router.get(AUTH_PATHS.user, schemaValidator(authPathBase.user), readUser);
console.log('User read path:', AUTH_PATHS.user);
router.put(AUTH_PATHS.updateUser, schemaValidator(authPathBase.updateUser), updateUser);
console.log('User update path:', AUTH_PATHS.updateUser);
router.post(AUTH_PATHS.logout, logout);
console.log('User logout path:', AUTH_PATHS.logout);
router.get(AUTH_PATHS.getGP, authenticate, getGP);

export default router;
