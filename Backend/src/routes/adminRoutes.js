import express from 'express';
import {
    adminRegister,
    adminLogin,
    me,
    readAdmin,
    updateAdmin,
    deleteAdmin,
    logout,
    getAllAdmins,
    getAllPatients,
    readPatient,
    updatePatient,
    getDoctors,
    getUserByPatientId
} from '../controllers/adminController.js';
import schemaValidator from '../middlewares/schemaValidator.js';
import {ADMIN_PATHS, buildPathWithBase} from './path.js';
import adminAuthorization from '../middlewares/adminAuthorization.js';

const router = express.Router();

const adminPathBase = buildPathWithBase(ADMIN_PATHS);

router.post(ADMIN_PATHS.register, schemaValidator(adminPathBase.register), adminRegister);
router.post(ADMIN_PATHS.login, schemaValidator(adminPathBase.login), adminLogin);
router.get(ADMIN_PATHS.me, adminAuthorization(['admin', 'doctor']), me);
router.get(ADMIN_PATHS.read, schemaValidator(adminPathBase.read), readAdmin);
router.put(ADMIN_PATHS.update, schemaValidator(adminPathBase.update), updateAdmin);
router.delete(ADMIN_PATHS.delete, deleteAdmin);
router.post(ADMIN_PATHS.logout, logout);
router.get(ADMIN_PATHS.getAllAdmins, schemaValidator(adminPathBase.getAllAdmins), getAllAdmins);
router.get(ADMIN_PATHS.getAllPatients, schemaValidator(adminPathBase.getAllPatients), getAllPatients);
router.get(ADMIN_PATHS.readPatient, schemaValidator(adminPathBase.readPatient), readPatient);
router.get(ADMIN_PATHS.getbyPatientID, schemaValidator(adminPathBase.readPatient), getUserByPatientId);
router.put(ADMIN_PATHS.updatePatient, schemaValidator(adminPathBase.updatePatient), updatePatient);
router.get(ADMIN_PATHS.getDoctors, schemaValidator(adminPathBase.getDoctors), getDoctors);

export default router;
