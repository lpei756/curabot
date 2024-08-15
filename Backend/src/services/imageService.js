import mongoose from 'mongoose';
import Grid from 'gridfs-stream';
import { GridFsStorage } from 'multer-gridfs-storage';
import multer from 'multer';
import Image from '../models/Image.js';

const conn = mongoose.connection;
let gfs;

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads'); // 设置文件存储的集合名称
    console.log('GridFS initialized');
});

// 配置 GridFS 存储引擎
const storage = new GridFsStorage({
    url: process.env.MONGO_URI, // 使用你的 MongoDB Cloud 连接字符串
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        console.log('GridFS Storing file:', file.originalname); // 打印文件名，检查是否正确传递
        return {
            filename: Date.now() + '-' + file.originalname,
            bucketName: 'uploads' // 文件存储在 'uploads' 集合中
        };
    }
});

// 创建 multer 中间件并导出
export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        console.log('File filter:', file); // 打印过滤器的信息
        cb(null, true); // 允许所有文件通过
    }
});

// 保存图片的服务逻辑
export const saveImageService = async (userId, filename) => {
    console.log('Saving image for user:', userId, 'with filename:', filename);
    const newImage = new Image({
        userId: userId,
        filename: filename,
    });

    const savedImage = await newImage.save();
    return savedImage;
};

// 获取用户图片的服务逻辑
export const getImagesByUser = async (userId) => {
    try {
        const images = await Image.find({ userId }).sort({ createdAt: -1 });
        return images;
    } catch (error) {
        throw new Error(`Error retrieving images: ${error.message}`);
    }
};

// 删除图片的服务逻辑
export const deleteImage = async (imageId) => {
    try {
        const deletedImage = await Image.findByIdAndDelete(imageId);
        if (!deletedImage) {
            throw new Error('Image not found');
        }

        // 删除 GridFS 中的文件
        gfs.remove({ filename: deletedImage.filename, root: 'uploads' }, (err) => {
            if (err) {
                console.error(`Error deleting file from GridFS: ${err.message}`);
                throw new Error(`Error deleting file from GridFS: ${err.message}`);
            }
        });

        return deletedImage;
    } catch (error) {
        throw new Error(`Error deleting image: ${error.message}`);
    }
};

// 获取图片流的服务逻辑（用于显示图片）
export const getImageStream = async (filename) => {
    try {
        const file = await gfs.files.findOne({ filename });
        if (!file) {
            throw new Error('File not found');
        }
        return gfs.createReadStream(file.filename);
    } catch (error) {
        throw new Error(`Error retrieving image: ${error.message}`);
    }
};
