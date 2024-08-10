import { saveImage as saveImageService, getImagesByUser, deleteImage } from '../services/imageService.js';

export const saveImage = async (req, res) => {
    try {
        const { userId, imageUrl } = req.body;
        const savedImage = await saveImageService(userId, imageUrl);
        res.status(201).json(savedImage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserImages = async (req, res) => {
    try {
        const { userId } = req.params;
        const images = await getImagesByUser(userId);
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeImage = async (req, res) => {
    try {
        const { imageId } = req.params;
        const deletedImage = await deleteImage(imageId);
        res.status(200).json(deletedImage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
