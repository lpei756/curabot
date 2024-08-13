import express from 'express';
import { saveImage, getUserImages, removeImage } from '../controllers/imageController.js';
import { IMAGE_PATHS } from './path.js';
import multer from 'multer';
import path from 'path';  // 添加这行导入路径模块

// 配置 multer，用于文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // 设置文件保存路径
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // 设置文件名
    }
});

const upload = multer({ storage: storage });

const router = express.Router();

// 使用 multer 的中间件处理上传的文件，并将处理后的请求交给 saveImage 控制器
router.post(IMAGE_PATHS.save, upload.single('image'), saveImage);
router.get(IMAGE_PATHS.read, getUserImages);
router.delete(IMAGE_PATHS.delete, removeImage);

export default router;
