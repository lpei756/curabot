import express from 'express';
import { getDoctorById, getDoctorsByClinic } from '../controllers/doctorController.js';
import { adminRegister, adminLogin } from '../controllers/adminController.js';
import { DOCTOR_PATHS } from './path.js';

const router = express.Router();

// 获取指定ID的医生信息
router.get(DOCTOR_PATHS.read, getDoctorById);

// 获取指定诊所的医生列表
router.get(DOCTOR_PATHS.clinicDoctors, getDoctorsByClinic);

// 医生注册
router.post(DOCTOR_PATHS.doctorRegister, adminRegister);

// 医生登录
router.post(DOCTOR_PATHS.doctorLogin, adminLogin);

export default router;
