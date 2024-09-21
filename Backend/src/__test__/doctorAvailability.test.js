import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import DoctorAvailability from '../models/DoctorAvailability.js';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Admin from '../models/Admin.js';
import Clinic from '../models/Clinic.js'

let mongoServer;
let admin;
let token;
let doctorID;

const generateToken = (user) => {
    return jwt.sign(
        { user },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

describe('Doctor Availability Controller', () => {
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

        const mockDoctorAvailability = new DoctorAvailability({
            doctorID: '123456',
            date: '2024-09-03T00:00:00.000Z',
            startTime: '2024-09-03T12:00:00.000Z',
            endTime: '2024-09-03T12:15:00.000Z',
            isBooked: false,
            bookedBy: null
        });
        const savedAvailability = await mockDoctorAvailability.save();
        doctorID = savedAvailability.doctorID;
    });

    afterAll(async () => {
        await Admin.deleteMany({});
        await DoctorAvailability.deleteMany({});
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('should set doctor availability successfully', async () => {
        const mockDoctorAvailability = {
            date: '2024-09-03T00:00:00.000Z',
            startTime: '2024-09-03T12:00:00.000Z',
            endTime: '2024-09-03T12:15:00.000Z',
            isBooked: false,
            bookedBy: null
        };

        const response = await request(app)
            .post('/api/doctor-availability/123456/set')
            .set('Authorization', `Bearer ${token}`)
            .send(mockDoctorAvailability);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Availability set successfully');
        expect(response.body.availability).toEqual(expect.objectContaining(mockDoctorAvailability));
    }, 10000);

    it('should handle errors when setting doctor availability', async () => {
        const invalidAvailability = {
        };

        const response = await request(app)
            .post('/api/doctor-availability/123456/set')
            .set('Authorization', `Bearer ${token}`)
            .send(invalidAvailability);

        expect(response.status).toBe(422);
    }, 10000);

    it('should get doctor availability by ID successfully', async () => {
        const response = await request(app)
            .get(`/api/doctor-availability/${doctorID}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
    });

    it('should return 404 if availability not found', async () => {
        const invalidID = new mongoose.Types.ObjectId();
        const response = await request(app)
            .get(`/api/doctor-availability/000000`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Availability not found');
    });

    it('should handle server errors', async () => {
        await mongoose.disconnect();

        const response = await request(app)
            .get(`/api/doctor-availability/${doctorID}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');

        await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
    });

    it('should get availability by date successfully', async () => {
        const testDate = '2024-09-04T00:00:00.000Z';
        await DoctorAvailability.create([
            {
                doctorID: 'doctor1',
                date: testDate,
                startTime: '2024-09-04T09:00:00.000Z',
                endTime: '2024-09-04T09:15:00.000Z',
                isBooked: false,
                bookedBy: null
            },
            {
                doctorID: 'doctor2',
                date: testDate,
                startTime: '2024-09-04T10:00:00.000Z',
                endTime: '2024-09-04T10:15:00.000Z',
                isBooked: false,
                bookedBy: null
            }
        ]);

        const response = await request(app)
            .get(`/api/doctor-availability/date/${testDate}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
    }, 10000);

    it('should return 200 with an empty array if no availability is found for the date', async () => {
        const response = await request(app)
            .get(`/api/doctor-availability/date/2024-10-01T00:00:00.000Z`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    }, 10000);

    it('should return 500 if there is a server error while fetching availability by date', async () => {
        jest.spyOn(DoctorAvailability, 'find').mockImplementationOnce(() => {
            throw new Error('Server error');
        });

        const response = await request(app)
            .get(`/api/doctor-availability/date/2024-09-04T00:00:00.000Z`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error');

        DoctorAvailability.find.mockRestore();
    }, 10000);

    it('should get doctor availability by location successfully', async () => {
        const clinic = await Clinic.create({
            name: 'Health Clinic',
            address: '123 Main Street, Auckland',
            email: 'info@healthclinic.com',
            phone: '123-456-7890',
            hours: 'Mon-Fri: 9am-5pm',
            service: 'General Practice',
            doctors: [
                { doctorID: '123456' },
                { doctorID: '654321' }
            ]
        });

        await DoctorAvailability.create([
            {
                doctorID: '123456',
                date: '2024-09-05T00:00:00.000Z',
                startTime: '2024-09-05T09:00:00.000Z',
                endTime: '2024-09-05T09:15:00.000Z',
                isBooked: false,
                bookedBy: null
            },
            {
                doctorID: '123456',
                date: '2024-09-03T00:00:00.000Z',
                startTime: '2024-09-03T12:00:00.000Z',
                endTime: '2024-09-03T12:15:00.000Z',
                isBooked: false,
                bookedBy: null
            },
            {
                doctorID: '654321',
                date: '2024-09-05T10:00:00.000Z',
                startTime: '2024-09-05T10:15:00.000Z',
                endTime: '2024-09-05T10:15:00.000Z',
                isBooked: false,
                bookedBy: null
            }
        ]);

        const response = await request(app)
            .get(`/api/doctor-availability/address/Auckland`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);

    }, 10000);

    it('should return 404 if no availability is found for the given location', async () => {
        const response = await request(app)
            .get(`/api/doctor-availability/address/Wellington`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('No availability found for this location');
    }, 10000);

    it('should handle server errors when fetching availability by location', async () => {
        jest.spyOn(Clinic, 'findOne').mockImplementationOnce(() => {
            throw new Error('Server error');
        });

        const response = await request(app)
            .get(`/api/doctor-availability/address/123 Main Street`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');

        Clinic.findOne.mockRestore();
    }, 10000);

    it('should get available slots successfully', async () => {
        await DoctorAvailability.create([
            {
                doctorID: '123456',
                date: '2024-09-05T00:00:00.000Z',
                startTime: '2024-09-05T09:00:00.000Z',
                endTime: '2024-09-05T09:15:00.000Z',
                isBooked: false,
                bookedBy: null
            },
            {
                doctorID: '654321',
                date: '2024-09-06T00:00:00.000Z',
                startTime: '2024-09-06T10:00:00.000Z',
                endTime: '2024-09-06T10:15:00.000Z',
                isBooked: false,
                bookedBy: null
            }
        ]);

        const response = await request(app)
            .get('/api/doctor-availability/all/slots')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
    }, 10000);

    it('should return 404 if no available slots are found', async () => {
        await DoctorAvailability.deleteMany({});

        const response = await request(app)
            .get('/api/doctor-availability/all/slots')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Availability not found');
    }, 10000);

    it('should handle server errors when fetching available slots', async () => {
        jest.spyOn(DoctorAvailability, 'find').mockImplementationOnce(() => {
            throw new Error('Failed to fetch available slots');
        });

        const response = await request(app)
            .get('/api/doctor-availability/all/slots')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error');
        expect(response.body.error).toBe('Failed to fetch available slots');

        DoctorAvailability.find.mockRestore();
    }, 10000);

    it('should update doctor availability successfully', async () => {
        const slot = await DoctorAvailability.create({
            doctorID: '123456',
            date: '2024-09-05T00:00:00.000Z',
            startTime: '2024-09-05T09:00:00.000Z',
            endTime: '2024-09-05T09:15:00.000Z',
            isBooked: false,
            bookedBy: null
        });

        const response = await request(app)
            .put(`/api/doctor-availability/${slot.doctorID}/slot/${slot._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                date: '2024-09-05T00:00:00.000Z',
                startTime: '2024-09-05T10:00:00.000Z',
                endTime: '2024-09-05T10:15:00.000Z',
                isBooked: true,
                bookedBy: 'someUser'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Slot updated successfully');
    }, 10000);

    it('should return 422 if required fields are missing', async () => {
        const slot = await DoctorAvailability.create({
            doctorID: '123456',
            date: '2024-09-05T00:00:00.000Z',
            startTime: '2024-09-05T09:00:00.000Z',
            endTime: '2024-09-05T09:15:00.000Z',
            isBooked: false,
            bookedBy: null
        });

        const response = await request(app)
            .put(`/api/doctor-availability/${slot.doctorID}/slot/${slot._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(response.status).toBe(422);
    }, 10000);

    it('should return 422 if date format is invalid', async () => {
        const slot = await DoctorAvailability.create({
            doctorID: '123456',
            date: '2024-09-05T00:00:00.000Z',
            startTime: '2024-09-05T09:00:00.000Z',
            endTime: '2024-09-05T09:15:00.000Z',
            isBooked: false,
            bookedBy: null
        });

        const response = await request(app)
            .put(`/api/doctor-availability/${slot.doctorID}/slot/${slot._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                startTime: 'invalid-date',
                endTime: 'invalid-date',
                isBooked: true,
                bookedBy: 'someUser'
            });

        expect(response.status).toBe(422);
    }, 10000);

    it('should delete doctor availability successfully', async () => {
        const slot = await DoctorAvailability.create({
            doctorID: '123456',
            date: '2024-09-05T00:00:00.000Z',
            startTime: '2024-09-05T09:00:00.000Z',
            endTime: '2024-09-05T09:15:00.000Z',
            isBooked: false,
            bookedBy: null
        });

        const response = await request(app)
            .delete(`/api/doctor-availability/${slot.doctorID}/slot/${slot._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Slot deleted successfully');

        const deletedSlot = await DoctorAvailability.findById(slot._id);
        expect(deletedSlot).toBeNull();
    }, 10000);

    it('should return 500 if the slot is not found', async () => {
        const response = await request(app)
            .delete(`/api/doctor-availability/123456/slot/nonExistentId`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error');
    }, 10000);

    it('should handle server errors when deleting availability', async () => {
        jest.spyOn(DoctorAvailability, 'deleteOne').mockImplementationOnce(() => {
            throw new Error('Server error');
        });

        const slot = await DoctorAvailability.create({
            doctorID: '123456',
            date: '2024-09-05T00:00:00.000Z',
            startTime: '2024-09-05T09:00:00.000Z',
            endTime: '2024-09-05T09:15:00.000Z',
            isBooked: false,
            bookedBy: null
        });

        const response = await request(app)
            .delete(`/api/doctor-availability/${slot.doctorID}/slot/${slot._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error');
        expect(response.body.error).toBe('Server error');

        jest.restoreAllMocks();
    }, 10000);
});
