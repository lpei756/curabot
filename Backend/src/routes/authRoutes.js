import express from 'express';
import { register, login, readUser, updateUser, logout, doctorRegister, doctorLogin, getGP } from '../controllers/authController.js';
import schemaValidator from '../middlewares/schemaValidator.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { AUTH_PATHS, buildPathWithBase, DOCTOR_PATHS } from './path.js';

const router = express.Router();

const authPathBase = buildPathWithBase(AUTH_PATHS);

// 用户相关路由
router.post(AUTH_PATHS.register, schemaValidator(authPathBase.register), register);
router.post(AUTH_PATHS.login, schemaValidator(authPathBase.login), login);
router.get(AUTH_PATHS.user, schemaValidator(authPathBase.user), readUser);
router.put(AUTH_PATHS.updateUser, schemaValidator(authPathBase.updateUser), updateUser);
router.post(AUTH_PATHS.logout, logout);
router.get(AUTH_PATHS.getGP, authenticate, getGP);

// 医生相关路由
router.post(DOCTOR_PATHS.register, schemaValidator(authPathBase.register), doctorRegister);
router.post(DOCTOR_PATHS.login, schemaValidator(authPathBase.login), doctorLogin);

export default router;
