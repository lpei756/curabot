import Image from '../models/Image.js';

export const saveImage = async (userId, imageUrl) => {
    try {
        if (!userId || !imageUrl) {
            throw new Error('User ID and Image URL are required');
        }

        const newImage = new Image({
            userId,
            imageUrl,
        });

        const savedImage = await newImage.save();
        return savedImage;
    } catch (error) {
        throw new Error(`Error saving image: ${error.message}`);
    }
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
        return deletedImage;
    } catch (error) {
        throw new Error(`Error deleting image: ${error.message}`);
    }
};
