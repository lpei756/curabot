import request from 'supertest';
import app from '../app';
import AdminModel from '../models/Admin';
import DoctorModel from '../models/Doctor';
import ClinicModel from '../models/Clinic';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { logout as logoutAdminService, getAllAdmins as getAllAdminsService, getAllPatients as getAllPatientsService, deleteAdmin as deleteAdminService, readAdmin as readAdminService } from '../services/adminService';

jest.mock('../models/Admin');
jest.mock('../models/Doctor');
jest.mock('../models/Clinic');
jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('../services/adminService');

describe('Admin Controller', () => {
    let mockAdmin;
    let token;

    beforeEach(() => {
        mockAdmin = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: bcrypt.hashSync('password123', 10),
            role: 'superadmin',
        };
        token = 'mockToken';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('adminRegister', () => {
        it('should register a new admin as superadmin', async () => {
            AdminModel.prototype.save = jest.fn().mockResolvedValue({
                ...mockAdmin,
                _id: 'adminId123'
            });
            jwt.sign.mockReturnValue(token);

            const res = await request(app)
                .post('/api/admin/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    role: 'superadmin',
                    password: 'Pass123!'
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('token');
        });

        it('should return 400 if admin already exists', async () => {
            AdminModel.findOne = jest.fn().mockResolvedValue({
                ...mockAdmin,
                _id: 'adminId123'
            });

            const res = await request(app)
                .post('/api/admin/register')
                .send({
                    ...mockAdmin,
                    password: 'SuperAdminPass123!'
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Admin already exists');
        });

        it('should register a new admin as doctor', async () => {
            const mockClinicId = new mongoose.Types.ObjectId().toString();
            mockAdmin = {
                ...mockAdmin,
                role: 'doctor',
                clinic: mockClinicId,
                languagesSpoken: ['English', 'Spanish'],
                specialty: 'Cardiology',
                password: 'Pass123!'
            };

            AdminModel.findOne = jest.fn().mockResolvedValue(null);
            AdminModel.prototype.save = jest.fn().mockResolvedValue({
                ...mockAdmin,
                _id: 'adminId'
            });
            DoctorModel.prototype.save = jest.fn().mockResolvedValue({
                ...mockAdmin,
                _id: 'doctorId'
            });
            ClinicModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});
            jwt.sign.mockReturnValue(token);

            const res = await request(app)
                .post('/api/admin/register')
                .send(mockAdmin);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('token');
        });
    });

    describe('adminLogin', () => {
        it('should login an admin with valid credentials', async () => {
            jest.spyOn(require('../services/adminService'), 'login').mockResolvedValue(mockAdmin);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue(token);

            const res = await request(app)
                .post('/api/admin/login')
                .send({ email: mockAdmin.email, password: 'Pass123' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('admin');
            expect(res.body).toHaveProperty('token');
        });

        it('should return 400 if invalid credentials', async () => {
            jest.spyOn(require('../services/adminService'), 'login').mockResolvedValue(null);
            bcrypt.compare.mockResolvedValue(false);

            const res = await request(app)
                .post('/api/admin/login')
                .send({ email: mockAdmin.email, password: 'wrongpassword' });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid credentials');
        });
    });

    describe('adminLogout', () => {
        it('should logout an admin successfully', async () => {
            logoutAdminService.mockResolvedValue({ message: 'Logged out successfully' });

            const res = await request(app)
                .post('/api/admin/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'Logged out successfully');
        });

        it('should return 400 if logout fails', async () => {
            logoutAdminService.mockRejectedValue(new Error('Logout failed'));

            const res = await request(app)
                .post('/api/admin/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Logout failed');
        });
    });

    describe('getAllAdmins', () => {
        it('should return all admins', async () => {
            const mockAdmins = [{ _id: 'adminId', firstName: 'John', lastName: 'Doe' }];
            getAllAdminsService.mockResolvedValue(mockAdmins);

            const res = await request(app).get('/api/admins');

            expect(res.status).toBe(200);
            expect(res.body.admins).toEqual(mockAdmins);
        });

        it('should return 500 if there is a server error', async () => {
            getAllAdminsService.mockRejectedValue(new Error('Server error'));

            const res = await request(app).get('/api/admins');

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Server error');
        });
    });

    describe('getAllPatients', () => {
        it('should return all patients', async () => {
            const mockPatients = [{ _id: 'patientId123', firstName: 'Jane', lastName: 'Doe' }];
            getAllPatientsService.mockResolvedValue(mockPatients);

            const res = await request(app).get('/api/patients');

            expect(res.status).toBe(200);
            expect(res.body.patients).toEqual(mockPatients);
        });

        it('should return 500 if there is a server error', async () => {
            getAllPatientsService.mockRejectedValue(new Error('Server error'));

            const res = await request(app).get('/api/patients');

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Server error');
        });
    });

    describe('deleteAdmin', () => {
        it('should delete an admin successfully', async () => {
            deleteAdminService.mockResolvedValue({ message: 'Admin deleted successfully' });

            const res = await request(app).delete('/api/admin/adminId');

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Admin deleted successfully');
        });

        it('should return 404 if admin not found', async () => {
            deleteAdminService.mockResolvedValue(null);

            const res = await request(app).delete('/api/admin/adminId');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Admin not found');
        });
    });

    describe('readAdmin', () => {
        it('should return an admin by ID', async () => {
            const mockAdmin = { _id: 'adminId123', firstName: 'John', lastName: 'Doe' };
            readAdminService.mockResolvedValue(mockAdmin);

            const res = await request(app).get('/api/admin/adminId');

            expect(res.status).toBe(200);
            expect(res.body.admin).toEqual(mockAdmin);
        });

        it('should return 404 if admin not found', async () => {
            readAdminService.mockResolvedValue(null);

            const res = await request(app).get('/api/admin/adminId');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Admin not found');
        });
    });
});
