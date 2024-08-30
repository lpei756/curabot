import express from 'express';
import {
    adminRegister,
    adminLogin,
    readAdmin,
    updateAdmin,
    logout,
    getAllAdmins,
    getAllPatients,
    readPatient,
    updatePatient,
    getDoctors
} from '../controllers/adminController.js';
import schemaValidator from '../middlewares/schemaValidator.js';
import {ADMIN_PATHS, buildPathWithBase} from './path.js';

const router = express.Router();

const adminPathBase = buildPathWithBase(ADMIN_PATHS);

router.post(ADMIN_PATHS.register, schemaValidator(adminPathBase.register), adminRegister);
router.post(ADMIN_PATHS.login, schemaValidator(adminPathBase.login), adminLogin);
router.get(ADMIN_PATHS.read, schemaValidator(adminPathBase.read), readAdmin);
router.put(ADMIN_PATHS.update, schemaValidator(adminPathBase.update), updateAdmin);
router.post(ADMIN_PATHS.logout, logout);
router.get(ADMIN_PATHS.getAllAdmins, schemaValidator(adminPathBase.getAllAdmins), getAllAdmins);
router.get(ADMIN_PATHS.getAllPatients, schemaValidator(adminPathBase.getAllPatients), getAllPatients);
router.get(ADMIN_PATHS.readPatient, schemaValidator(adminPathBase.readPatient), readPatient);
router.put(ADMIN_PATHS.updatePatient, schemaValidator(adminPathBase.updatePatient), updatePatient);
router.get(ADMIN_PATHS.getDoctors, schemaValidator(adminPathBase.getDoctors), getDoctors);

export default router;
