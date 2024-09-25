import multer from 'multer';
import Image from '../models/Image.js';
import { uploadFileToS3, deleteFileFromS3 } from '../utils/s3Service.js';

export const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        console.log(`Uploading file: ${file.originalname}`);
        cb(null, true);
    }
});

export const saveImageService = async (userId, file) => {
    console.log(`Starting upload for ${file.originalname} for user ${userId}`);
    try {
        if (!file.buffer) {
            throw new Error('File buffer is missing');
        }
        const s3Result = await uploadFileToS3(file, process.env.AWS_S3_BUCKET_NAME);
        console.log(`File uploaded to S3: ${s3Result.url}`);
        const newImage = new Image({
            userId: userId,
            filename: file.originalname,
            s3Url: s3Result.url,
        });

        const savedImage = await newImage.save();
        console.log(`Image saved to MongoDB with ID: ${savedImage._id}`);

        return {
            _id: savedImage._id,
            userId: savedImage.userId,
            filename: savedImage.filename,
            url: savedImage.s3Url,
            createdAt: savedImage.createdAt
        };
    } catch (error) {
        console.error(`Error saving image: ${error.message}`);
        throw new Error(`Error saving image: ${error.message}`);
    }
};

export const getImagesByUser = async (userId) => {
    console.log(`Retrieving images for user ${userId}`);
    try {
        const images = await Image.find({ userId }).sort({ createdAt: -1 });
        console.log(`Retrieved ${images.length} images for user ${userId}`);
        return images;
    } catch (error) {
        console.error(`Error retrieving images: ${error.message}`);
        throw new Error(`Error retrieving images: ${error.message}`);
    }
};

export const deleteImage = async (imageId) => {
    console.log(`Deleting image with ID ${imageId}`);
    try {
        const deletedImage = await Image.findByIdAndDelete(imageId);
        if (!deletedImage) {
            console.error('Image not found');
            throw new Error('Image not found');
        }
        console.log(`Image deleted from MongoDB, attempting to delete from S3: ${deletedImage.s3Url}`);
        await deleteFileFromS3(deletedImage.s3Url.split('/').pop(), process.env.AWS_S3_BUCKET_NAME);
        console.log(`File deleted from S3: ${deletedImage.s3Url}`);
        return deletedImage;
    } catch (error) {
        console.error(`Error deleting image: ${error.message}`);
        throw new Error(`Error deleting image: ${error.message}`);
    }
};
