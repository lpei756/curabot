import express from 'express';
import { saveImage, getUserImages, removeImage } from '../controllers/imageController.js';
import { IMAGE_PATHS } from './path.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.post(IMAGE_PATHS.save, upload.single('image'), saveImage);
router.get(IMAGE_PATHS.read, getUserImages);
router.delete(IMAGE_PATHS.delete, removeImage);

export default router;
