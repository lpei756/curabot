import express from 'express';
import multer from 'multer';
import path from 'path';
import { IMAGE_PATHS } from './path.js';
import { getUserImages, removeImage, saveImage } from '../controllers/imageController.js'; // 使用相对路径导入

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
        next(); // 文件上传成功，继续执行下一个中间件（即 saveImage）
    } else {
        res.status(400).send('No file uploaded');
    }
}, saveImage);

// 获取用户的图片信息
router.get(IMAGE_PATHS.read, getUserImages);

// 删除图片信息和文件
router.delete(IMAGE_PATHS.delete, removeImage);

export default router;
