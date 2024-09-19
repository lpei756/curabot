import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import { getClinicByIdService, getAllClinics } from '../services/clinicService.js';

jest.mock('../services/clinicService.js');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB memory server started and connected.');
});

afterAll(async () => {
    console.log('Disconnecting mongoose...');
    await mongoose.disconnect();
    console.log('Stopping MongoDB memory server...');
    await mongoServer.stop();
    console.log('MongoDB memory server stopped.');
});

beforeEach(async () => {
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('Clinic Controller', () => {
    const clinicData = {
        _id: '66ac6360d1864aef73c64a69',
        name: 'Urgent Care Auckland',
        service: 'Urgent Care',
        hours: '24/7',
        address: '50 Park Road, Grafton, Auckland 1023',
        phone: '09-1234567',
        fax: '09-1234568',
        healthlinkEDI: 'EDI10001',
        email: 'contact@urgentcareauckland.nz',
        doctors: [
            { firstName: 'Alice', lastName: 'Smith', doctorID: 'D001' },
            { firstName: 'Bob', lastName: 'Johnson', doctorID: 'D002' },
            { firstName: 'Carol', lastName: 'Williams', doctorID: 'D003' },
            { firstName: 'Doctor', lastName: 'Admin', doctorID: 'D048', _id: '66dd6e67e2989a0a8048b5b9' },
            { firstName: 'Doctor', lastName: 'Admin', doctorID: 'D049', _id: '66dd7165e6a880fd0755a446' },
            { firstName: 'Doctor', lastName: 'Admin', doctorID: 'D046', _id: '66de2ffe40bcd91191c1d6a7' }
        ]
    };

    it('should return all clinics', async () => {
        getAllClinics.mockResolvedValue([clinicData]);

        const response = await request(app).get('/api/clinics');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([clinicData]);
    });

    it('should handle errors from the service layer', async () => {
        getAllClinics.mockRejectedValue(new Error('Service error'));

        const response = await request(app).get('/api/clinics');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });

    it('should return clinic by ID', async () => {
        getClinicByIdService.mockResolvedValue({ error: false, clinic: clinicData });

        const response = await request(app).get(`/api/clinics/${clinicData._id}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(clinicData);
    });

    it('should return 404 for a non-existent clinic', async () => {
        getClinicByIdService.mockResolvedValue({ error: true, status: 404, message: 'Clinic not found' });

        const response = await request(app).get('/api/clinics/nonExistentId');
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Clinic not found');
    });

    it('should handle errors from the service layer when fetching by ID', async () => {
        getClinicByIdService.mockRejectedValue(new Error('Service error'));

        const response = await request(app).get('/api/clinics/someId');
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');
    });
});
