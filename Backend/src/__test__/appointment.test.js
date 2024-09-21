import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import User from '../models/User.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { createAppointment as createAppointmentService, readAppointment as readAppointmentService, updateAppointment as updateAppointmentService, deleteAppointment as deleteAppointmentService, getAppointmentsForAUser } from '../services/appointmentService.js';

jest.mock('../models/User.js');
jest.mock('../models/Appointment.js');
jest.mock('../services/appointmentService.js');
jest.mock('../middlewares/authMiddleware.js');

let mongoServer;

const createMockUser = async (role = 'patient') => {
    const user = {
        _id: 'userId123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password',
        role,
        patientID: 'patient123',
        appointments: []
    };
    User.findById.mockResolvedValue(user);
    return user;
};

describe('Appointment Controller', () => {
    let mockUser;
    let authToken;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        mockUser = await createMockUser();
        authToken = 'mockToken';

        authenticate.mockImplementation((req, res, next) => {
            req.user = mockUser;
            next();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/appointments/create', () => {
        it('should create a new appointment', async () => {
            const mockClinicId = '66eb744834c6f9a9e05aa99a';
            const mockSlotId = '66eb744834c6f9a9e05aa99b';

            const appointmentData = {
                dateTime: new Date(),
                clinic: mockClinicId,
                assignedGP: 'doctor123',
                slotId: mockSlotId,
                status: 'Scheduled',
                notes: 'Check-up',
                prescriptionsIssued: 'None'
            };

            const mockAppointment = {
                ...appointmentData,
                appointmentID: 'appointment123',
                _id: 'appointmentId123',
            };

            createAppointmentService.mockResolvedValue({
                error: false,
                appointment: mockAppointment
            });

            const res = await request(app)
                .post('/api/appointments/create')
                .set('Authorization', `Bearer ${authToken}`)
                .send(appointmentData);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('appointmentID');
            expect(res.body.appointmentID).toBe('appointment123');
        });

        it('should return 401 if user is not authenticated', async () => {
            authenticate.mockImplementation((req, res, next) => {
                req.user = null;
                next();
            });

            const res = await request(app)
                .post('/api/appointments/create')
                .send({
                    dateTime: new Date(),
                    clinic: 'clinic123',
                    assignedGP: 'doctor123',
                    slotId: 'slot123'
                });

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'User not authenticated');
        });
    });

    describe('GET /api/appointments/:appointmentID', () => {
        it('should return the appointment details for an authenticated user', async () => {
            const mockAppointmentId = 'appointment123';

            const mockAppointment = {
                appointmentID: mockAppointmentId,
                dateTime: new Date(),
                clinic: 'clinic123',
                assignedGP: 'doctor123',
                status: 'Scheduled',
                patientID: mockUser.patientID,
                patientName: `${mockUser.firstName} ${mockUser.lastName}`
            };

            readAppointmentService.mockResolvedValue(mockAppointment);

            const res = await request(app)
                .get(`/api/appointments/${mockAppointmentId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('appointmentID', mockAppointmentId);
        });

        it('should return 401 if the user is not authenticated', async () => {
            authenticate.mockImplementation((req, res, next) => {
                req.user = null;
                next();
            });

            const mockAppointmentId = 'appointment123';

            const res = await request(app)
                .get(`/api/appointments/${mockAppointmentId}`);

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'User not authenticated');
        });

        it('should return 404 if the appointment is not found', async () => {
            const mockAppointmentId = 'nonexistentAppointment';

            readAppointmentService.mockResolvedValue({
                error: true,
                status: 404,
                message: 'Appointment not found'
            });

            const res = await request(app)
                .get(`/api/appointments/${mockAppointmentId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Appointment not found');
        });

        it('should return 500 if there is a server error', async () => {
            const mockAppointmentId = 'appointment123';

            readAppointmentService.mockResolvedValue({
                error: true,
                status: 500,
                message: 'Internal server error'
            });

            const res = await request(app)
                .get(`/api/appointments/${mockAppointmentId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Internal server error');
        });
    });

    describe('PUT /api/appointments/:appointmentID/update', () => {
        it('should update the appointment for an authenticated user', async () => {
            const mockAppointmentId = 'appointment123';
            const updateData = {
                dateTime: new Date(),
                status: 'Cancelled',
                notes: 'Follow-up needed',
            };

            const updatedAppointment = {
                ...updateData,
                appointmentID: mockAppointmentId,
                patientID: mockUser.patientID,
                assignedGP: 'doctor123',
                clinic: 'clinic123',
                slotId: 'slot123',
            };

            updateAppointmentService.mockResolvedValue(updatedAppointment);

            const res = await request(app)
                .put(`/api/appointments/${mockAppointmentId}/update`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('appointmentID', mockAppointmentId);
        });

        it('should return 401 if the user is not authenticated', async () => {
            authenticate.mockImplementation((req, res, next) => {
                req.user = null;
                next();
            });

            const mockAppointmentId = 'appointment123';

            const res = await request(app)
                .put(`/api/appointments/${mockAppointmentId}/update`)
                .send({
                    dateTime: new Date(),
                    status: 'Cancelled',
                    notes: 'Follow-up needed',
                });

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'User not authenticated');
        });

        it('should return 404 if the appointment is not found or user is not authorized', async () => {
            const mockAppointmentId = 'nonexistentAppointment';

            updateAppointmentService.mockResolvedValue({
                error: true,
                status: 404,
                message: 'Appointment not found or not authorized to update',
            });

            const res = await request(app)
                .put(`/api/appointments/${mockAppointmentId}/update`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    dateTime: new Date(),
                    status: 'Cancelled',
                    notes: 'Follow-up needed',
                });

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Appointment not found or not authorized to update');
        });

        it('should return 500 if there is a server error', async () => {
            const mockAppointmentId = 'appointment123';

            updateAppointmentService.mockResolvedValue({
                error: true,
                status: 500,
                message: 'Internal server error',
            });

            const res = await request(app)
                .put(`/api/appointments/${mockAppointmentId}/update`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    dateTime: new Date(),
                    status: 'Cancelled',
                    notes: 'Follow-up needed',
                });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Internal server error');
        });
    });

    describe('DELETE /api/appointments/:appointmentID', () => {
        it('should successfully delete (cancel) an appointment', async () => {
            const mockAppointmentId = 'appointment123';

            deleteAppointmentService.mockResolvedValue({
                error: false,
                message: 'Appointment cancelled successfully',
            });

            const res = await request(app)
                .delete(`/api/appointments/${mockAppointmentId}`)
                .send();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'Appointment cancelled successfully');
            expect(deleteAppointmentService).toHaveBeenCalledWith(mockAppointmentId);
        });

        it('should return 404 if the appointment is not found', async () => {
            const mockAppointmentId = 'nonexistentAppointment';

            deleteAppointmentService.mockResolvedValue({
                error: true,
                status: 404,
                message: 'Appointment not found',
            });

            const res = await request(app)
                .delete(`/api/appointments/${mockAppointmentId}`)
                .send();

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Appointment not found');
            expect(deleteAppointmentService).toHaveBeenCalledWith(mockAppointmentId);
        });

        it('should return 500 if there is a server error', async () => {
            const mockAppointmentId = 'appointment123';

            deleteAppointmentService.mockResolvedValue({
                error: true,
                status: 500,
                message: 'Internal server error',
            });

            const res = await request(app)
                .delete(`/api/appointments/${mockAppointmentId}`)
                .send();

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Internal server error');
            expect(deleteAppointmentService).toHaveBeenCalledWith(mockAppointmentId);
        });
    });
});