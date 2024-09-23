import request from 'supertest';
import app from '../app';
import {
    sendMessage as sendMessageService,
    getNotifications as getNotificationsService,
    markAsRead as markAsReadService,
    deleteNotification as deleteNotificationService,
} from '../services/notificationService.js';
import Admin from '../models/Admin.js';
import Doctor from '../models/Doctor.js';

jest.mock('../services/notificationService.js');
jest.mock('../models/Admin.js');
jest.mock('../models/Doctor.js');

describe('Notification Controller', () => {
    describe('POST /api/notifications/send', () => {
        it('should send a message and return the notification object', async () => {
            const mockNotification = { id: 'notification123', message: 'Test message' };
            sendMessageService.mockResolvedValue(mockNotification);

            const res = await request(app)
                .post('/api/notifications/send')
                .send({
                    senderId: 'sender123',
                    senderModel: 'Admin',
                    receiverId: 'receiver123',
                    receiverModel: 'Doctor',
                    message: 'Test message',
                    notificationType: 'info'
                });

            expect(res.status).toBe(201);
            expect(res.body.notification).toEqual(mockNotification);
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/notifications/send')
                .send({
                    senderId: 'sender123',
                    receiverId: 'receiver123',
                    message: 'Test message',
                });

            expect(res.status).toBe(400);
            expect(res.body.status).toBe('failed');
            expect(res.body.error).toBe('Invalid request. Please review request and try again.');
        });

        it('should return 500 if there is a server error', async () => {
            sendMessageService.mockRejectedValue(new Error('Error sending message'));

            const res = await request(app)
                .post('/api/notifications/send')
                .send({
                    senderId: 'sender123',
                    senderModel: 'Admin',
                    receiverId: 'receiver123',
                    receiverModel: 'Doctor',
                    message: 'Test message',
                    notificationType: 'info'
                });

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Error sending message');
        });
    });

    describe('GET /api/notifications/user/:userId', () => {
        it('should return notifications for the user', async () => {
            const mockNotifications = [{ id: 'notification1', message: 'Test message 1' }];
            getNotificationsService.mockResolvedValue(mockNotifications);

            const res = await request(app).get('/api/notifications/user/user123');

            expect(res.status).toBe(200);
            expect(res.body.notifications).toEqual(mockNotifications);
        });

        it('should return 500 if there is a server error', async () => {
            getNotificationsService.mockRejectedValue(new Error('Error fetching notifications'));

            const res = await request(app).get('/api/notifications/user/user123');

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Error fetching notifications');
        });
    });

    describe('GET /api/notifications/admin/:adminId', () => {
        it('should return admin notifications', async () => {
            const mockNotifications = [{ id: 'notification1', message: 'Admin message 1' }];
            Admin.findOne.mockResolvedValue({ _id: 'admin123', role: 'doctor' });
            getNotificationsService.mockResolvedValue(mockNotifications);

            const res = await request(app).get('/api/notifications/admin/admin123');

            expect(res.status).toBe(200);
            expect(res.body.notifications).toEqual(mockNotifications);
        });

        it('should return 404 if admin is not found', async () => {
            Admin.findOne.mockResolvedValue(null);
            Doctor.findById.mockResolvedValue(null);

            const res = await request(app).get('/api/notifications/admin/admin123?receiverModel=Doctor');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Doctor not found');
        });

        it('should return 500 if there is a server error', async () => {
            Admin.findOne.mockRejectedValue(new Error('Error fetching notifications'));

            const res = await request(app).get('/api/notifications/admin/admin123');

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Error fetching notifications');
        });
    });

    describe('PUT /api/notifications/:notificationId/read', () => {
        it('should mark notification as read', async () => {
            const mockNotification = { id: 'notification1', message: 'Test message', read: true };
            markAsReadService.mockResolvedValue(mockNotification);

            const res = await request(app).put('/api/notifications/notification1/read');

            expect(res.status).toBe(200);
            expect(res.body.notification).toEqual(mockNotification);
        });

        it('should return 404 if notification is not found', async () => {
            markAsReadService.mockResolvedValue(null);

            const res = await request(app).put('/api/notifications/notification1/read');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Notification not found');
        });

        it('should return 500 if there is a server error', async () => {
            markAsReadService.mockRejectedValue(new Error('Error marking notification as read'));

            const res = await request(app).put('/api/notifications/notification1/read');

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Error marking notification as read');
        });
    });

    describe('DELETE /api/notifications/:notificationId', () => {
        it('should delete a notification', async () => {
            deleteNotificationService.mockResolvedValue(true);

            const res = await request(app).delete('/api/notifications/notification1');

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Notification deleted successfully');
        });

        it('should return 404 if notification is not found', async () => {
            deleteNotificationService.mockResolvedValue(false);

            const res = await request(app).delete('/api/notifications/notification1');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Notification not found');
        });

        it('should return 500 if there is a server error', async () => {
            deleteNotificationService.mockRejectedValue(new Error('Error deleting notification'));

            const res = await request(app).delete('/api/notifications/notification1');

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Error deleting notification');
        });
    });
});
