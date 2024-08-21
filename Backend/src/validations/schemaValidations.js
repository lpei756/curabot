import Joi from 'joi';
import { ADMIN_PATHS, AUTH_PATHS, APPOINTMENT_PATHS, DOCTOR_AVAILABILITY_PATHS, DOCTOR_PATHS, buildPathWithBase } from '../routes/path.js';

const adminPathBase = buildPathWithBase(ADMIN_PATHS);
const authPathBase = buildPathWithBase(AUTH_PATHS);
const appointmentPathBase = buildPathWithBase(APPOINTMENT_PATHS);
const doctorAvailabilityPathBase = buildPathWithBase(DOCTOR_AVAILABILITY_PATHS);
const doctorPathBase = buildPathWithBase(DOCTOR_PATHS);


const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required(),
    middleName: Joi.string().allow("").optional(),
    lastName: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
    gender: Joi.string().required(),
    bloodGroup: Joi.string().optional(),
    ethnicity: Joi.string().optional(),
    address: Joi.string().required(),
    phone: Joi.string().required(),
    emergencyContact: Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().required(),
        relationship: Joi.string().required()
    }).required(),
    medicalHistory: Joi.object({
        chronicDiseases: Joi.string().optional(),
        pastSurgeries: Joi.string().optional(),
        familyMedicalHistory: Joi.string().optional(),
        medicationList: Joi.string().optional(),
        allergies: Joi.string().optional()
    }).optional(),
    insurance: Joi.object({
        provider: Joi.string().required(),
        policyNumber: Joi.string().allow("").optional(),
        coverageDetails: Joi.string().optional()
    }).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const userSchema = Joi.object({
    id: Joi.string().required()
});

const updateUserSchema = Joi.object({
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    firstName: Joi.string().optional(),
    middleName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().optional(),
    bloodGroup: Joi.string().optional(),
    ethnicity: Joi.string().optional(),
    address: Joi.string().optional(),
    phone: Joi.string().optional(),
    emergencyContact: Joi.object({
        name: Joi.string().optional(),
        phone: Joi.string().optional(),
        relationship: Joi.string().optional()
    }).optional(),
    medicalHistory: Joi.object({
        chronicDiseases: Joi.string().optional(),
        pastSurgeries: Joi.string().optional(),
        familyMedicalHistory: Joi.string().optional(),
        medicationList: Joi.string().optional(),
        allergies: Joi.string().optional()
    }).optional(),
    insurance: Joi.object({
        provider: Joi.string().optional(),
        policyNumber: Joi.string().optional(),
        coverageDetails: Joi.string().optional()
    }).optional()
});

const createAppointmentSchema = Joi.object({
    dateTime: Joi.date().required(),
    clinic: Joi.string().required(),
    assignedGP: Joi.string().required(),
    status: Joi.string().valid('Confirmed', 'Scheduled', 'Cancelled').optional(),
    notes: Joi.string().optional(),
    prescriptionsIssued: Joi.string().optional()
});

const readAppointmentSchema = Joi.object({
    id: Joi.string().required()
});

const updateAppointmentSchema = Joi.object({
    dateTime: Joi.date().optional(),
    clinic: Joi.string().optional(),
    assignedGP: Joi.string().optional(),
    status: Joi.string().valid('Confirmed', 'Scheduled', 'Cancelled').optional(),
    notes: Joi.string().optional(),
    prescriptionsIssued: Joi.string().optional()
});

const setDoctorAvailabilitySchema = Joi.object({
    date: Joi.date().required(),
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
    isBooked: Joi.boolean().default(false),
    bookedBy: Joi.string().allow(null).optional()
});

const getDoctorAvailabilitySchema = Joi.object({
    date: Joi.date().optional()
});

const updateDoctorAvailabilitySchema = Joi.object({
    date: Joi.date().required(),
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
    isBooked: Joi.boolean().default(false),
    bookedBy: Joi.string().allow(null).optional()
});

const getDoctorAvailabilityByDateSchema = Joi.object({
    date: Joi.date().required()
});

const getDoctorAvailabilityByAddressSchema = Joi.object({
    address: Joi.string().required()
});

const doctorRegisterSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    clinic: Joi.string().required(),
    languagesSpoken: Joi.array().items(Joi.string()).optional(),
    specialty: Joi.string().optional(),
});

const doctorLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const adminRegisterSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('superadmin', 'doctor', 'nurse').required(),
});

const adminLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const adminReadSchema = Joi.object({
    id: Joi.string().required()
});

const adminUpdateSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    role: Joi.string().valid('superadmin', 'doctor', 'nurse').optional(),
});

const getAllAdminsSchema = Joi.object({});
const getAllPatientsSchema = Joi.object({});

export default {
    [authPathBase.register]: registerSchema,
    [authPathBase.login]: loginSchema,
    [appointmentPathBase.create]: createAppointmentSchema,
    [appointmentPathBase.read]: readAppointmentSchema,
    [appointmentPathBase.update]: updateAppointmentSchema,
    [authPathBase.user]: userSchema,
    [authPathBase.updateUser]: updateUserSchema,
    [doctorAvailabilityPathBase.set]: setDoctorAvailabilitySchema,
    [doctorAvailabilityPathBase.getByDoctor]: getDoctorAvailabilitySchema,
    [doctorAvailabilityPathBase.getByDate]: getDoctorAvailabilityByDateSchema,
    [doctorAvailabilityPathBase.update]: updateDoctorAvailabilitySchema,
    [doctorAvailabilityPathBase.getByAddress]: getDoctorAvailabilityByAddressSchema,
    [doctorPathBase.doctorRegister]: doctorRegisterSchema,
    [doctorPathBase.doctorLogin]: doctorLoginSchema,
    [adminPathBase.register]: adminRegisterSchema,
    [adminPathBase.login]: adminLoginSchema,
    [adminPathBase.read]: adminReadSchema,
    [adminPathBase.update]: adminUpdateSchema,
    [adminPathBase.logout]: adminUpdateSchema,
    [adminPathBase.getAllAdmins]: getAllAdminsSchema,
    [adminPathBase.getAllPatients]: getAllPatientsSchema,
};
