import request from 'supertest';
import app from '../app';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import mongoose from 'mongoose';
import { authenticate } from '../middlewares/authMiddleware.js';
import { APPOINTMENT_PATHS } from '../routes/path.js';

jest.mock('../models/User.js');
jest.mock('../models/Appointment.js');
jest.mock('../services/appointmentService.js');
jest.mock('../middlewares/authMiddleware.js');

const createMockUser = async (role = 'patient') => {
  const user = new User({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password',
    role,
    patientID: 'patient123',
    appointments: []
  });
  await user.save();
  return user;
};

describe('Appointment Controller', () => {
  let mockUser;
  let authToken;
  let mockAppointmentId;

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
      const mockClinicId = new mongoose.Types.ObjectId();
      const mockSlotId = new mongoose.Types.ObjectId();

      const appointmentData = {
        dateTime: new Date(),
        clinic: mockClinicId.toString(),
        assignedGP: 'doctor123',
        slotId: mockSlotId.toString(),
        status: 'Scheduled',
        notes: 'Check-up',
        prescriptionsIssued: 'None'
      };

      Appointment.prototype.save = jest.fn().mockResolvedValue({
        ...appointmentData,
        appointmentID: 'appointment123',
        _id: 'appointmentId123'
      });

      const res = await request(app)
        .post(APPOINTMENT_PATHS.create)
        .set('Authorization', `Bearer ${authToken}`)
        .send(appointmentData);

      console.log('Response:', res.body);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('appointmentID');
    });

    it('should return 401 if user is not authenticated', async () => {
      authenticate.mockImplementation((req, res, next) => {
        req.user = null;
        next();
      });

      const res = await request(app)
        .post(APPOINTMENT_PATHS.create)
        .send({
          dateTime: new Date(),
          clinic: 'clinic123',
          assignedGP: 'doctor123',
          slotId: 'slot123'
        });

      console.log('Response:', res.body);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'User not authenticated');
    });
  });

  describe('GET /api/appointments/:appointmentID', () => {
    it('should fetch an appointment', async () => {
      const appointment = {
        appointmentID: 'appointment123',
        dateTime: new Date(),
        clinic: 'clinic123',
        assignedGP: 'doctor123',
        slotId: 'slot123',
        status: 'Scheduled'
      };

      Appointment.findOne = jest.fn().mockResolvedValue(appointment);

      const res = await request(app)
        .get(`/api/appointments/${appointment.appointmentID}`)
        .set('Authorization', `Bearer ${authToken}`);

      console.log('Response:', res.body);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('appointmentID', appointment.appointmentID);
    });

    it('should return 404 if appointment not found', async () => {
      Appointment.findOne = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/appointments/invalidID`)
        .set('Authorization', `Bearer ${authToken}`);

      console.log('Response:', res.body);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Appointment not found');
    });
  });

  describe('GET /api/appointments', () => {
    it('should fetch all appointments for a user', async () => {
      const appointments = [{
        appointmentID: 'appointment123',
        dateTime: new Date(),
        clinic: 'clinic123',
        assignedGP: 'doctor123',
        slotId: 'slot123',
        status: 'Scheduled'
      }];

      Appointment.find = jest.fn().mockResolvedValue(appointments);

      const res = await request(app)
        .get(APPOINTMENT_PATHS.all)
        .set('Authorization', `Bearer ${authToken}`);

      console.log('Response:', res.body);
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body[0]).toHaveProperty('appointmentID', 'appointment123');
    });

    it('should fetch all appointments for a specific patient', async () => {
      const mockPatientID = 'patient123';
      const appointments = [{
        appointmentID: 'appointment123',
        dateTime: new Date(),
        clinic: 'clinic123',
        assignedGP: 'doctor123',
        slotId: 'slot123',
        status: 'Scheduled'
      }];

      Appointment.find = jest.fn().mockResolvedValue(appointments);

      const res = await request(app)
        .get(`/api/appointments/patient/${mockPatientID}`)
        .set('Authorization', `Bearer ${authToken}`);

      console.log('Response:', res.body);
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body[0]).toHaveProperty('appointmentID', 'appointment123');
    });
  });

  describe('PUT /api/appointments/:appointmentID/update', () => {
    it('should update an appointment', async () => {
      const appointmentUpdateData = {
        notes: 'Updated notes'
      };

      Appointment.findOneAndUpdate = jest.fn().mockResolvedValue({
        ...appointmentUpdateData,
        appointmentID: 'appointment123',
        _id: 'appointmentId123'
      });

      const res = await request(app)
        .put(`/api/appointments/${mockAppointmentId}/update`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(appointmentUpdateData);

      console.log('Response:', res.body);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('notes', 'Updated notes');
    });
  });

  describe('DELETE /api/appointments/:appointmentID', () => {
    it('should cancel an appointment', async () => {
      Appointment.findOneAndUpdate = jest.fn().mockResolvedValue({
        appointmentID: 'appointment123',
        status: 'Cancelled'
      });

      const res = await request(app)
        .delete(`/api/appointments/${mockAppointmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      console.log('Response:', res.body);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Appointment cancelled successfully');
    });
  });
});