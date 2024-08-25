import express from 'express';
import {
    adminRegister,
    adminLogin,
    readAdmin,
    updateAdmin,
    logout,
    getAllAdmins,
    getAllPatients
} from '../controllers/adminController.js';
import schemaValidator from '../middlewares/schemaValidator.js';
import { ADMIN_PATHS, buildPathWithBase } from './path.js';

const router = express.Router();

const adminPathBase = buildPathWithBase(ADMIN_PATHS);

console.log('adminPathBase:', adminPathBase);

router.post(ADMIN_PATHS.register, schemaValidator(adminPathBase.register), adminRegister);
console.log('Admin register path:', ADMIN_PATHS.register);
router.post(ADMIN_PATHS.login, schemaValidator(adminPathBase.login), adminLogin);
console.log('Admin login path:', ADMIN_PATHS.login);
router.get(ADMIN_PATHS.read, schemaValidator(adminPathBase.read), readAdmin);
console.log('Admin read path:', ADMIN_PATHS.read);
router.put(ADMIN_PATHS.update, schemaValidator(adminPathBase.update), updateAdmin);
console.log('Admin update path:', ADMIN_PATHS.update);
router.post(ADMIN_PATHS.logout, logout);
console.log('Admin logout path:', ADMIN_PATHS.logout);
router.get(ADMIN_PATHS.getAllAdmins, schemaValidator(adminPathBase.getAllAdmins), getAllAdmins);
console.log('Admin getAllAdmins path:', ADMIN_PATHS.getAllAdmins)
router.get(ADMIN_PATHS.getAllPatients, schemaValidator(adminPathBase.getAllPatients), getAllPatients);
console.log('Admin getAllPatients path:', ADMIN_PATHS.getAllPatients);
export default router;


