import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import multer from 'multer';
import Image from '../models/Image.js';
import { GridFsStorage } from 'multer-gridfs-storage';

const conn = mongoose.connection;
let gfs;

conn.once('open', () => {
    gfs = new GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
    console.log('GridFSBucket initialized');
});

const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {
        console.log('GridFS Storing file:', file.originalname);
        return {
            filename: Date.now() + '-' + file.originalname,
            bucketName: 'uploads'
        };
    }
});

export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        console.log('File filter:', file);
        cb(null, true);
    }
});

export const saveImageService = async (userId, filename) => {
    console.log('Saving image for user:', userId, 'with filename:', filename);

    const imageUrl = `${process.env.BASE_URL}/uploads/${filename}`;
    console.log('Constructed image URL:', imageUrl);

    const newImage = new Image({
        userId: userId,
        filename: filename,
    });

    const savedImage = await newImage.save();

    return {
        _id: savedImage._id,
        userId: savedImage.userId,
        filename: savedImage.filename,
        url: imageUrl,
        createdAt: savedImage.createdAt
    };
};

export const getImagesByUser = async (userId) => {
    try {
        const images = await Image.find({ userId }).sort({ createdAt: -1 });
        return images;
    } catch (error) {
        throw new Error(`Error retrieving images: ${error.message}`);
    }
};

export const deleteImage = async (imageId) => {
    try {
        const deletedImage = await Image.findByIdAndDelete(imageId);
        if (!deletedImage) {
            throw new Error('Image not found');
        }

        gfs.delete(new mongoose.Types.ObjectId(deletedImage._id), (err) => {
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

export const getImageStream = async (filename) => {
    try {
        const files = await gfs.find({ filename }).toArray();
        if (!files || files.length === 0) {
            throw new Error('File not found');
        }
        return gfs.openDownloadStreamByName(filename);
    } catch (error) {
        throw new Error(`Error retrieving image: ${error.message}`);
    }
};
