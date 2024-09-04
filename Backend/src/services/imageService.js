import mongoose from 'mongoose';
import Grid from 'gridfs-stream';
import multer from 'multer';
import Image from '../models/Image.js';
import pkg from 'multer-gridfs-storage';
const { GridFsStorage } = pkg;

const conn = mongoose.connection;
let gfs;

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
    console.log('GridFS initialized');
});

const storage = new GridFsStorage({
    db: conn,
    file: (req, file) => {
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
