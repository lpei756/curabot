import express from 'express';
import { uploadTestResult, readTestResult } from '../controllers/testResultController.js';
import { TEST_RESULT_PATHS, buildPathWithBase } from './path.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import adminAuthorization from '../middlewares/adminAuthorization.js';
import schemaValidator from '../middlewares/schemaValidator.js';

const router = express.Router();

const testResultPathBase = buildPathWithBase(TEST_RESULT_PATHS);

router.post(TEST_RESULT_PATHS.upload, authenticate, adminAuthorization(['doctor', 'nurse']), schemaValidator(testResultPathBase.upload), uploadTestResult);
router.get(TEST_RESULT_PATHS.read, authenticate, readTestResult);
 
export default router;