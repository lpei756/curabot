import express from 'express';
import { saveImage, getUserImages, removeImage } from '../controllers/imageController.js';
import { IMAGE_PATHS } from './path.js';

const router = express.Router();

router.post(IMAGE_PATHS.save, saveImage);
router.get(IMAGE_PATHS.read, getUserImages);
router.delete(IMAGE_PATHS.read, removeImage);

export default router;
