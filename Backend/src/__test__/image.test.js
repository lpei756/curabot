import request from 'supertest';
import app from '../app';
import { saveImageService, getImagesByUser, deleteImage } from '../services/imageService.js';

jest.mock('../services/imageService.js');

describe('Image Controller', () => {
    describe('POST /api/images', () => {
        it('should save an image and return the saved image object', async () => {
            const mockSavedImage = { id: 'imageId123', userId: 'userId123', filename: 'image.jpg' };

            saveImageService.mockResolvedValue(mockSavedImage);

            const res = await request(app)
                .post('/api/images')
                .field('userId', 'userId123')
                .attach('file', 'path/to/mockImage.jpg')

            expect(res.status).toBe(201);
            expect(res.body).toEqual(mockSavedImage);
        });

        it('should return 400 if no file is uploaded', async () => {
            const res = await request(app)
                .post('/api/images')
                .field('userId', 'userId123'); // No file uploaded

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'No file uploaded.');
        });

        it('should return 400 if userId is missing', async () => {
            const res = await request(app)
                .post('/api/images')
                .attach('file', 'path/to/mockImage.jpg'); // No userId provided

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'User ID is required.');
        });

        it('should return 500 if there is a server error', async () => {
            saveImageService.mockRejectedValue(new Error('Error saving image'));

            const res = await request(app)
                .post('/api/images')
                .field('userId', 'userId123')
                .attach('file', 'path/to/mockImage.jpg');

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Error saving image');
        });
    });

    describe('GET /api/images/user/:userId', () => {
        it('should return a list of images for the given user', async () => {
            const mockImages = [
                { id: 'imageId123', userId: 'userId123', filename: 'image1.jpg' },
                { id: 'imageId124', userId: 'userId123', filename: 'image2.jpg' }
            ];

            getImagesByUser.mockResolvedValue(mockImages);

            const res = await request(app).get('/api/images/user/userId123');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockImages);
        });

        it('should return 500 if there is a server error', async () => {
            getImagesByUser.mockRejectedValue(new Error('Error fetching images'));

            const res = await request(app).get('/api/images/user/userId123');

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Error fetching images');
        });
    });

    describe('DELETE /api/images/:imageId', () => {
        it('should delete the image and return the deleted image object', async () => {
            const mockDeletedImage = { id: 'imageId123', userId: 'userId123', filename: 'image.jpg' };

            deleteImage.mockResolvedValue(mockDeletedImage);

            const res = await request(app).delete('/api/images/imageId123');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockDeletedImage);
        });

        it('should return 500 if there is a server error', async () => {
            deleteImage.mockRejectedValue(new Error('Error deleting image'));

            const res = await request(app).delete('/api/images/imageId123');

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Error deleting image');
        });
    });
});
