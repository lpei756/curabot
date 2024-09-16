import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import app from '../app';
import User from '../models/User';
import { MongoMemoryServer } from 'mongodb-memory-server';
import sendEmail from '../utils/sendEmail.js';

process.env.JWT_SECRET = 'testsecret';

jest.mock('../utils/sendEmail', () => jest.fn());

let mongoServer;

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
    await mongoose.connection.db.dropDatabase();

    global.mockedVerificationCode = null;

    app.get('/api/auth/test-verification-code', (req, res) => {
        res.json({ code: global.mockedVerificationCode });
    });
});

describe('Auth Controller Integration Tests', () => {
    describe('POST /register', () => {
        it('should register a new user and return a token', async () => {
            sendEmail.mockImplementation((email, subject, content) => {
                global.mockedVerificationCode = content.match(/Your verification code is: (\w+)/)[1];
                return Promise.resolve();
            });

            await request(app)
                .post('/api/auth/send-verification-code')
                .send({ email: 'validemail@example.com' })
                .expect(200);

            const codeResponse = await request(app)
                .get('/api/auth/test-verification-code')
                .expect(200);

            const verificationCode = codeResponse.body.code;

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'validemail@example.com',
                    password: 'Password123',
                    verificationCode: verificationCode,
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '555-5555',
                    address: '123 Elm St',
                    dateOfBirth: '2000-01-01'
                })
                .expect(201);

            expect(response.body.user).toHaveProperty('_id');
            expect(response.body).toHaveProperty('token');
        });

        it('should return 422 if registration fails', async () => {
            sendEmail.mockImplementation((email, subject, content) => {
                global.mockedVerificationCode = content.match(/Your verification code is: (\w+)/)[1];
                return Promise.resolve();
            });

            await request(app)
                .post('/api/auth/send-verification-code')
                .send({ email: 'invalidemail@example.com' })
                .expect(200);

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalidemail@example.com',
                    password: 'short123',
                    verificationCode: 'wrongcode',
                    firstName: 'John',
                    lastName: 'Doe',
                    dateOfBirth: '2000-01-01',
                    address: '123 Elm St',
                    phone: '555-5555'
                })
                .expect(422);

            expect(response.body.message).toBe('Invalid verification code');
        });
    });

    describe('POST /login', () => {
        beforeEach(async () => {
            const password = await bcrypt.hash('password123', 10);
            await User.create({
                email: 'testuser@test.com',
                password,
                verificationCode: '123456',
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: new Date('1990-01-01'),
                address: '123 Main St',
                phone: '555-1234'
            });
        });

        it('should log in an existing user and return a token', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'testuser@test.com', password: 'password123' })
                .expect(200);

            expect(response.body.user).toHaveProperty('_id');
            expect(response.body).toHaveProperty('token');
        });

        it('should return 400 if login credentials are invalid', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'nonexistent@test.com', password: 'wrongpassword' })
                .expect(400);

            expect(response.body.message).toBe('User not found');
        });
    });

    describe('GET /user/:id', () => {
        let token;
        let user;

        beforeEach(async () => {
            const password = await bcrypt.hash('password123', 10);
            user = await User.create({
                email: 'testuser@test.com',
                password,
                verificationCode: '123456',
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: new Date('1990-01-01'),
                address: '123 Main St',
                phone: '555-1234'
            });
            token = jwt.sign({ user: { _id: user._id } }, process.env.JWT_SECRET, { expiresIn: '12h' });
        });

        it('should return the user information', async () => {
            const response = await request(app)
                .get(`/api/auth/user/${user._id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.user).toHaveProperty('_id', user._id.toString());
            expect(response.body.user).toHaveProperty('email', 'testuser@test.com');
            expect(response.body.user).toHaveProperty('firstName', 'John');
        });

        it('should return 404 if user is not found', async () => {
            const response = await request(app)
                .get(`/api/auth/user/invalidid`)
                .set('Authorization', `Bearer ${token}`)
                .expect(404);

            expect(response.body.message).toBe('User not found');
        });
    });

    describe('PUT /user/:id', () => {
        let token;
        let user;

        beforeEach(async () => {
            const password = await bcrypt.hash('password123', 10);
            user = await User.create({
                email: 'testuser@test.com',
                password,
                verificationCode: '123456',
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: new Date('1990-01-01'),
                address: '123 Main St',
                phone: '555-1234'
            });
            token = jwt.sign({ user: { _id: user._id } }, process.env.JWT_SECRET, { expiresIn: '12h' });
        });

        it('should update the user details', async () => {
            const response = await request(app)
                .put(`/api/auth/user/${user._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ email: 'updatedemail@test.com' })
                .expect(200);

            expect(response.body.email).toBe('updatedemail@test.com');
        });

        it('should return 422 if update data is invalid', async () => {
            const response = await request(app)
                .put(`/api/auth/user/${user._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ email: 'invalidemail' })
                .expect(422);

            expect(response.body.error).toBeDefined();
        });
    });
});
