import { saveImageService, getImagesByUser, deleteImage } from '../services/imageService.js';

export const saveImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }
        const savedImage = await saveImageService(userId, req.file);
        res.status(201).json(savedImage);
    } catch (error) {
        console.error('Error saving image:', error);
        res.status(500).json({ message: 'An error occurred while saving the image.', details: error.message });
    }
};

export const getUserImages = async (req, res) => {
    try {
        const { userId } = req.params;
        const images = await getImagesByUser(userId);
        res.status(200).json(images);
    } catch (error) {
        console.error('Error retrieving images:', error);
        res.status(500).json({ message: 'An error occurred while retrieving images.', details: error.message });
    }
};

export const removeImage = async (req, res) => {
    try {
        const { imageId } = req.params;
        const deletedImage = await deleteImage(imageId);
        res.status(200).json(deletedImage);
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'An error occurred while deleting the image.', details: error.message });
    }
};
