import request from 'supertest';
import app from '../app';
import AdminModel from '../models/Admin';
import DoctorModel from '../models/Doctor';
import ClinicModel from '../models/Clinic';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

jest.mock('../models/Admin');
jest.mock('../models/Doctor');
jest.mock('../models/Clinic');
jest.mock('jsonwebtoken');

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
            AdminModel.findOne.mockResolvedValue(null);
            AdminModel.prototype.save = jest.fn().mockResolvedValue({
                ...mockAdmin,
                _id: 'adminId123'
            });
            jwt.sign.mockReturnValue(token);

            const res = await request(app)
                .post('/api/admin/register')
                .send(mockAdmin);

            console.log('Response body for superadmin registration:', res.body);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('token');
        });

        it('should return 400 if admin already exists', async () => {
            AdminModel.findOne.mockResolvedValue({
                ...mockAdmin,
                _id: 'adminId123'
            });

            const res = await request(app)
                .post('/api/admin/register')
                .send(mockAdmin);

            console.log('Response body for existing admin case:', res.body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Admin already exists');
        });

        it('should register a new admin as doctor', async () => {
            console.log('Starting doctor registration test');

            const mockClinicId = new mongoose.Types.ObjectId().toString();
            mockAdmin = {
                ...mockAdmin,
                role: 'doctor',
                clinic: mockClinicId,
                languagesSpoken: ['English', 'Spanish'],
                specialty: 'Cardiology',
            };

            console.log('Mock admin:', mockAdmin);

            AdminModel.findOne.mockResolvedValue(null);
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

            console.log('Response body for doctor registration:', res.body);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('token');
        });
    });
});
