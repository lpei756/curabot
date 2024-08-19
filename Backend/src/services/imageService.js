import mongoose from 'mongoose';
import Grid from 'gridfs-stream';
import { GridFsStorage } from 'multer-gridfs-storage';
import multer from 'multer';
import Image from '../models/Image.js';

const conn = mongoose.connection;
let gfs;

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
    console.log('GridFS initialized');
});

// 配置 GridFS 存储引擎
const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        console.log('GridFS Storing file:', file.originalname);
        return {
            filename: Date.now() + '-' + file.originalname,
            bucketName: 'uploads'
        };
    }
});

// 创建 multer 中间件并导出
export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        console.log('File filter:', file);
        cb(null, true);
    }
});

export const saveImageService = async (userId, filename) => {
    console.log('Saving image for user:', userId, 'with filename:', filename);

    // 构建图片的访问URL
    const imageUrl = `${process.env.BASE_URL}/uploads/${filename}`;
    console.log('Constructed image URL:', imageUrl); // 确保 URL 被正确生成
    // 创建并保存新的图片文档
    const newImage = new Image({
        userId: userId,
        filename: filename,
    });

    const savedImage = await newImage.save();

    // 返回完整的JSON响应
    return {
        _id: savedImage._id,
        userId: savedImage.userId,
        filename: savedImage.filename,
        url: imageUrl,
        createdAt: savedImage.createdAt
    };
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
