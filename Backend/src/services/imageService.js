import Image from '../models/Image.js';
import fs from 'fs';
import path from 'path';

export const saveImage = async (req, res) => {
    upload.single('image')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ message: err.message });
        } else if (err) {
            return res.status(500).json({ message: 'An unknown error occurred when uploading.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        try {
            const imageUrl = req.file.path;
            const userId = req.body.userId;

            const savedImage = await saveImageService(userId, imageUrl);
            res.status(201).json(savedImage);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
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

        const imagePath = path.resolve(deletedImage.imageUrl);
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error(`Error deleting file from file system: ${err.message}`);
                throw new Error(`Error deleting file from file system: ${err.message}`);
            }
        });

        return deletedImage;
    } catch (error) {
        throw new Error(`Error deleting image: ${error.message}`);
    }
};
