import request from 'supertest';
import app from '../app';
import AdminModel from '../models/Admin';
import DoctorModel from '../models/Doctor';
import ClinicModel from '../models/Clinic';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Mocking modules
jest.mock('../models/Admin');
jest.mock('../models/Doctor');
jest.mock('../models/Clinic');
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

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
                    password: 'SuperAdminPass123!'
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
                password: 'DoctorPass123!'
            };

            AdminModel.findOne = jest.fn().mockResolvedValue(null);
            AdminModel.prototype.save = jest.fn().mockResolvedValue({
                ...mockAdmin,
                _id: 'adminId123'
            });
            DoctorModel.prototype.save = jest.fn().mockResolvedValue({
                ...mockAdmin,
                _id: 'doctorId123'
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
                .send({ email: mockAdmin.email, password: 'password123' });

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
});