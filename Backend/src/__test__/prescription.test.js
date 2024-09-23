import request from 'supertest';
import app from '../app';
import {
    generatePrescription as generatePrescriptionService,
    repeatPrescription as repeatPrescriptionService,
    getAllPrescriptions as getAllPrescriptionsService,
    getUserPrescriptions as getUserPrescriptionsService,
} from '../services/prescriptionService.js';
import { sendMessage as sendMessageService } from '../services/notificationService.js';

// 模拟 Prescription 和 Notification 服务
jest.mock('../services/prescriptionService.js');
jest.mock('../services/notificationService.js');

// 模拟身份验证中间件，确保路径正确
jest.mock('../middlewares/adminAuthorization.js', () => {
    return (roles) => (req, res, next) => {
        req.user = { _id: '66dd76e91f0a63478ff7d862', role: 'doctor' }; // 使用你提供的 doctor _id
        next();
    };
});

describe('Prescription Controller', () => {
    const mockToken = 'mockToken';

    describe('GET /api/prescriptions', () => {
        it('should return all prescriptions for the user', async () => {
            const mockPrescriptions = [
                {
                    _id: '66e7b489832f1aadff70bc2a',
                    doctor: '66dd76e91f0a63478ff7d862',
                    patient: '66bdeabc60fa938950d70f23',
                    medications: 'Amoxicillin, 500mg, twice a day',
                    instructions: 'Take after meals with water',
                    doctorName: 'Alice Smith',
                    patientName: 'Bess Yang',
                    createdAt: '2024-09-16T04:31:05.651+00:00',
                },
            ];
            getAllPrescriptionsService.mockResolvedValue(mockPrescriptions);

            const res = await request(app)
                .get('/api/prescriptions')
                .set('Authorization', `Bearer ${mockToken}`)
                .send();

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockPrescriptions);
        });

        it('should return 404 if no prescriptions are found', async () => {
            getAllPrescriptionsService.mockResolvedValue([]);

            const res = await request(app)
                .get('/api/prescriptions')
                .set('Authorization', `Bearer ${mockToken}`)
                .send();

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('No prescriptions found');
        });

        it('should return 500 if there is a server error', async () => {
            getAllPrescriptionsService.mockRejectedValue(new Error('Server error'));

            const res = await request(app)
                .get('/api/prescriptions')
                .set('Authorization', `Bearer ${mockToken}`)
                .send();

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Server error');
        });
    });

    describe('GET /api/prescriptions/user/:userId', () => {
        it('should return prescriptions for a specific user', async () => {
            const mockPrescriptions = [
                {
                    _id: '66e7b489832f1aadff70bc2a',
                    doctor: '66dd76e91f0a63478ff7d862',
                    patient: '66bdeabc60fa938950d70f23',
                    medications: 'Amoxicillin, 500mg, twice a day',
                    instructions: 'Take after meals with water',
                    doctorName: 'Alice Smith',
                    patientName: 'Bess Yang',
                    createdAt: '2024-09-16T04:31:05.651+00:00',
                },
            ];
            getUserPrescriptionsService.mockResolvedValue(mockPrescriptions);

            const res = await request(app)
                .get('/api/prescriptions/user/66bdeabc60fa938950d70f23')
                .set('Authorization', `Bearer ${mockToken}`)
                .send();

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockPrescriptions);
        });

        it('should return 403 if the requestor is not authorized', async () => {
            const res = await request(app)
                .get('/api/prescriptions/user/66bdeabc60fa938950d70f23')
                .set('Authorization', `Bearer ${mockToken}`)
                .send();

            expect(res.status).toBe(403);
            expect(res.body.message).toBe('Access denied');
        });

        it('should return 404 if no prescriptions are found for the user', async () => {
            getUserPrescriptionsService.mockResolvedValue([]);

            const res = await request(app)
                .get('/api/prescriptions/user/66bdeabc60fa938950d70f23')
                .set('Authorization', `Bearer ${mockToken}`)
                .send();

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('No prescriptions found for this user');
        });

        it('should return 500 if there is a server error', async () => {
            getUserPrescriptionsService.mockRejectedValue(new Error('Server error'));

            const res = await request(app)
                .get('/api/prescriptions/user/66bdeabc60fa938950d70f23')
                .set('Authorization', `Bearer ${mockToken}`)
                .send();

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Server error');
        });
    });

    describe('POST /api/prescriptions/generate', () => {
        it('should generate a new prescription', async () => {
            const mockPrescription = {
                doctorName: 'Alice Smith',
                medications: 'Amoxicillin, 500mg, twice a day',
                instructions: 'Take after meals with water',
            };
            generatePrescriptionService.mockResolvedValue(mockPrescription);
            sendMessageService.mockResolvedValue({});

            const res = await request(app)
                .post('/api/prescriptions/generate')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                    doctorId: '66dd76e91f0a63478ff7d862',
                    userId: '66bdeabc60fa938950d70f23',
                    medications: 'Amoxicillin, 500mg, twice a day',
                    instructions: 'Take after meals with water',
                });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Prescription generated successfully');
            expect(res.body.prescription).toEqual(mockPrescription);
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/prescriptions/generate')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                    doctorId: '66dd76e91f0a63478ff7d862',
                    medications: 'Amoxicillin, 500mg, twice a day',
                });

            expect(res.status).toBe(400);
            expect(res.body.status).toBe('failed');
            expect(res.body.error).toBe('Invalid request. Missing required fields.');
        });

        it('should return 500 if there is a server error', async () => {
            generatePrescriptionService.mockRejectedValue(new Error('Server error'));

            const res = await request(app)
                .post('/api/prescriptions/generate')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                    doctorId: '66dd76e91f0a63478ff7d862',
                    userId: '66bdeabc60fa938950d70f23',
                    medications: 'Amoxicillin, 500mg, twice a day',
                    instructions: 'Take after meals with water',
                });

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Error generating prescription: Server error');
        });
    });

    describe('POST /api/prescriptions/repeat', () => {
        it('should repeat a prescription', async () => {
            const mockPrescription = {
                doctorName: 'Alice Smith',
                medications: 'Amoxicillin, 500mg, twice a day',
                instructions: 'Take after meals with water',
            };
            repeatPrescriptionService.mockResolvedValue(mockPrescription);
            sendMessageService.mockResolvedValue({});

            const res = await request(app)
                .post('/api/prescriptions/repeat')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                    doctorId: '66dd76e91f0a63478ff7d862',
                    userId: '66bdeabc60fa938950d70f23',
                    prescriptionId: '66e7b489832f1aadff70bc2a',
                });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Repeat prescription generated successfully');
            expect(res.body.prescription).toEqual(mockPrescription);
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/prescriptions/repeat')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                    doctorId: '66dd76e91f0a63478ff7d862',
                });

            expect(res.status).toBe(400);
            expect(res.body.status).toBe('failed');
            expect(res.body.error).toBe('Invalid request. Missing required fields.');
        });

        it('should return 500 if there is a server error', async () => {
            repeatPrescriptionService.mockRejectedValue(new Error('Server error'));

            const res = await request(app)
                .post('/api/prescriptions/repeat')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                    doctorId: '66dd76e91f0a63478ff7d862',
                    userId: '66bdeabc60fa938950d70f23',
                    prescriptionId: '66e7b489832f1aadff70bc2a',
                });

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Error generating repeat prescription: Server error');
        });
    });
});
