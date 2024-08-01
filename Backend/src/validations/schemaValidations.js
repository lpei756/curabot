import Joi from 'joi';
import { AUTH_PATHS, buildPathWithBase } from '../routes/path.js';
const authPathBase = buildPathWithBase(AUTH_PATHS);

// Define Joi schema validations for different routes
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required(),
    middleName: Joi.string().optional(),
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
        policyNumber: Joi.string().optional(),
        coverageDetails: Joi.string().optional()
    }).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

// Export the schema validations
export default {
    [authPathBase.register]: registerSchema,
    [authPathBase.login]: loginSchema,
};
