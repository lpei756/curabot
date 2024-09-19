import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import Clinic from '../models/Clinic';
import Doctor from '../models/Doctor';

describe('Doctor Controller', () => {
    let validClinic, validDoctor;

    beforeAll(async () => {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        validClinic = await Clinic.create({
            _id: new mongoose.Types.ObjectId(),
            name: 'Test Clinic',
            service: 'General',
            hours: '9am - 5pm',
            address: '123 Test St',
            phone: '123-456-7890',
            email: 'test@clinic.com',
            doctors: [
                {
                    firstName: 'John',
                    lastName: 'Doe',
                    doctorID: 'D001'
                }
            ]
        });

        validDoctor = await Doctor.create({
            _id: new mongoose.Types.ObjectId(),
            doctorID: 'D001',
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@clinic.com',
            password: 'hashed_password',
            clinic: validClinic._id,
            languagesSpoken: ['English'],
            specialty: 'Cardiology'
        });
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    describe('GET /api/clinics/:clinicId/doctors', () => {
        it('should return doctors for a valid clinic', async () => {
            const response = await request(app)
                .get(`/api/clinics/${validClinic._id}/doctors`)
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].firstName).toBe('John');
        });

        it('should return 404 if clinic not found', async () => {
            const response = await request(app)
                .get(`/api/clinics/nonExistentId/doctors`)
                .expect(400);

            expect(response.body.error).toBe('Invalid clinic ID format');
        });

        it('should return 404 if no doctors are found for the clinic', async () => {
            const emptyClinic = await Clinic.create({
                _id: new mongoose.Types.ObjectId(),
                name: 'Empty Clinic',
                service: 'General',
                hours: '9am - 5pm',
                address: '456 Test St',
                phone: '987-654-3210',
                email: 'empty@clinic.com',
                doctors: []
            });

            const response = await request(app)
                .get(`/api/clinics/${emptyClinic._id}/doctors`)
                .expect(404);

            expect(response.body.error).toBe('No doctors found for this clinic');
        });

        it('should handle server errors gracefully', async () => {
            jest.spyOn(Clinic, 'findById').mockImplementation(() => {
                throw new Error('Server error');
            });

            const response = await request(app)
                .get(`/api/clinics/${validClinic._id}/doctors`)
                .expect(500);

            expect(response.body.error).toBe('Internal server error');
        });
    });

    describe('GET /api/doctors/:doctorID', () => {
        it('should return doctor details for a valid doctorID', async () => {
            const response = await request(app)
                .get(`/api/doctors/${validDoctor.doctorID}`)
                .expect(200);

            expect(response.body.firstName).toBe('Jane');
        });

        it('should return 404 if doctor not found', async () => {
            const response = await request(app)
                .get(`/api/doctors/${validDoctor._id}`)
                .expect(404);
        });
    });
});
