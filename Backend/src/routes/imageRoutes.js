import express from 'express';
import multer from 'multer';
import path from 'path';
import { IMAGE_PATHS } from './path.js';
import { getUserImages, removeImage, saveImage } from '../controllers/imageController.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.post(IMAGE_PATHS.save, upload.single('image'), (req, res, next) => {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    if (req.file) {
        next();
    } else {
        res.status(400).send('No file uploaded');
    }
}, saveImage);

router.get(IMAGE_PATHS.read, getUserImages);

router.delete(IMAGE_PATHS.delete, removeImage);

export default router;
