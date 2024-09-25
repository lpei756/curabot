import express from 'express';
import { IMAGE_PATHS } from './path.js';
import { getUserImages, removeImage, saveImage } from '../controllers/imageController.js';
import { upload } from '../services/imageService.js';

const router = express.Router();

router.post(IMAGE_PATHS.save, upload.single('image'), saveImage);

router.get(IMAGE_PATHS.read, getUserImages);

router.delete(IMAGE_PATHS.delete, removeImage);
export default router;
