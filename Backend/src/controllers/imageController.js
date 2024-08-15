import { saveImageService, getImagesByUser, deleteImage, getImageStream } from '../services/imageService.js';

// 保存图片的控制器
export const saveImage = async (req, res) => {
    try {
        console.log('req.file:', req.file);
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const userId = req.body.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        const savedImage = await saveImageService(userId, req.file.filename);
        res.status(201).json(savedImage);
    } catch (error) {
        console.error('Error saving image:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// 获取用户图片信息的控制器
export const getUserImages = async (req, res) => {
    try {
        const { userId } = req.params;
        const images = await getImagesByUser(userId);
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 删除图片信息的控制器
export const removeImage = async (req, res) => {
    try {
        const { imageId } = req.params;
        const deletedImage = await deleteImage(imageId);
        res.status(200).json(deletedImage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 获取图片流的控制器（用于显示图片）
export const getImageByFilename = async (req, res) => {
    try {
        const { filename } = req.params;
        const imageStream = await getImageStream(filename);

        imageStream.on('error', (err) => {
            return res.status(404).json({ message: 'Image not found' });
        });

        res.set('Content-Type', 'image/jpeg'); // 根据需要设置图片的内容类型
        imageStream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
