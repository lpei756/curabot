import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import TestResult from '../models/TestResult.js';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Admin from '../models/Admin.js';
import path from 'path';
import fs from 'fs';

let mongoServer;
let token;
let admin;

const generateToken = (user) => {
    return jwt.sign(
        { user },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

describe('Test Result Controller', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

        const mockAdminId = new mongoose.Types.ObjectId();
        admin = new Admin({
            _id: mockAdminId,
            firstName: 'John',
            lastName: 'Doe',
            email: 'doctor@example.com',
            password: 'password',
            role: 'doctor',
            doctor: new mongoose.Types.ObjectId(),
            adminID: '123456'
        });
        await admin.save();

        token = generateToken({ _id: mockAdminId, role: 'doctor' });

        fs.writeFileSync(path.join(__dirname, 'testFile.pdf'), 'Test file content');
    });

    afterAll(async () => {
        await Admin.deleteMany({});
        await TestResult.deleteMany({});
        await mongoose.disconnect();
        await mongoServer.stop();

        if (fs.existsSync(path.join(__dirname, 'testFile.pdf'))) {
            fs.unlinkSync(path.join(__dirname, 'testFile.pdf'));
        }
    });

    it('should return 400 if no file is uploaded', async () => {
        const response = await request(app)
            .post('/api/test-result/upload')
            .set('Authorization', `Bearer ${token}`)
            .field('patientID', 'P001')
            .field('doctorID', admin._id.toString())
            .field('testName', 'Blood Test')
            .expect(400);

        expect(response.body.message).toBe('No file uploaded');
    });

    it('should return 400 if patientID or doctorID is missing', async () => {
        const response = await request(app)
            .post('/api/test-result/upload')
            .set('Authorization', `Bearer ${token}`)
            .field('testName', 'Blood Test')
            .attach('file', path.join(__dirname, 'testFile.pdf'))
            .expect(400);

        expect(response.body.message).toBe('Patient ID and Doctor ID are required');
    });

    it('should handle server errors gracefully', async () => {
        jest.spyOn(require('../services/testResultService.js'), 'uploadTestResultService').mockImplementation(() => {
            throw new Error('Server error');
        });

        const response = await request(app)
            .post('/api/test-result/upload')
            .set('Authorization', `Bearer ${token}`)
            .field('patientID', 'P001')
            .field('doctorID', admin._id.toString())
            .field('testName', 'Blood Test')
            .attach('file', path.join(__dirname, 'testFile.pdf'))
            .expect(500);

        expect(response.body.message).toBe('Internal server error');
    });
});