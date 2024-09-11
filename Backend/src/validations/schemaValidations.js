import Joi from 'joi';
import {
    ADMIN_PATHS,
    AUTH_PATHS,
    APPOINTMENT_PATHS,
    DOCTOR_AVAILABILITY_PATHS,
    DOCTOR_PATHS,
    NOTIFICATION_PATHS,
    buildPathWithBase,
    TEST_RESULT_PATHS
} from '../routes/path.js';

const adminPathBase = buildPathWithBase(ADMIN_PATHS);
const authPathBase = buildPathWithBase(AUTH_PATHS);
const appointmentPathBase = buildPathWithBase(APPOINTMENT_PATHS);
const doctorAvailabilityPathBase = buildPathWithBase(DOCTOR_AVAILABILITY_PATHS);
const doctorPathBase = buildPathWithBase(DOCTOR_PATHS);
const notificationPathBase = buildPathWithBase(NOTIFICATION_PATHS);
const testresultPathBase = buildPathWithBase(TEST_RESULT_PATHS);

const feedbackSchema = Joi.object({
    messageId: Joi.string().required(),
    userId: Joi.string().optional(),
    feedback: Joi.boolean().required(),
});

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    verificationCode: Joi.string().required(),
    firstName: Joi.string().required(),
    middleName: Joi.string().allow("").optional(),
    lastName: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
    gender: Joi.string().optional(),
    bloodGroup: Joi.string().optional(),
    ethnicity: Joi.string().optional(),
    address: Joi.string().required(),
    phone: Joi.string().required(),
    emergencyContact: Joi.object({
        name: Joi.string().allow("").optional(),
        phone: Joi.string().allow("").optional(),
        relationship: Joi.string().allow("").optional()
    }).optional(),
    medicalHistory: Joi.object({
        chronicDiseases: Joi.string().allow("").optional(),
        pastSurgeries: Joi.string().allow("").optional(),
        familyMedicalHistory: Joi.string().allow("").optional(),
        medicationList: Joi.string().allow("").optional(),
        allergies: Joi.string().allow("").optional()
    }).optional(),
    insurance: Joi.object({
        provider: Joi.string().allow("").optional(),
        policyNumber: Joi.string().allow("").optional(),
        coverageDetails: Joi.string().allow("").optional()
    }).optional()
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
    slotId: Joi.string().required(),
    status: Joi.string().valid('Scheduled', 'Cancelled').optional(),
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
    status: Joi.string().valid('Scheduled', 'Cancelled').optional(),
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
    clinic: Joi.when('role', {
        is: 'doctor',
        then: Joi.string().required(),
        otherwise: Joi.forbidden()
    }),
    languagesSpoken: Joi.when('role', {
        is: 'doctor',
        then: Joi.array().items(Joi.string()).optional(),
        otherwise: Joi.forbidden()
    }),
    specialty: Joi.when('role', {
        is: 'doctor',
        then: Joi.string().allow('').optional(),
        otherwise: Joi.forbidden()
    }),
});

const adminLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const meSchema = Joi.object({
    id: Joi.string().required()
});

const adminReadSchema = Joi.object({
    id: Joi.string().required()
});

const updateAdminSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    role: Joi.string().valid('superadmin', 'doctor', 'nurse').optional(),
    clinic: Joi.when('role', {
        is: 'doctor',
        then: Joi.string().optional(),
        otherwise: Joi.forbidden()
    }),
    languagesSpoken: Joi.when('role', {
        is: 'doctor',
        then: Joi.array().items(Joi.string()).optional(),
        otherwise: Joi.forbidden()
    }),
    specialty: Joi.when('role', {
        is: 'doctor',
        then: Joi.string().allow('').optional(),
        otherwise: Joi.forbidden()
    }),
}).or('firstName', 'lastName', 'email', 'role', 'clinic', 'languagesSpoken', 'specialty');

const adminLogoutSchema = Joi.object({
});

const deleteAdminSchema = Joi.object({
});

const getAllAdminsSchema = Joi.object({});
const getAllPatientsSchema = Joi.object({});
const updatePatientSchema = Joi.object({
    email: Joi.string().email().required(),
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

const readPatientSchema = Joi.object({
});

const getDoctorsSchema = Joi.object({});

const sendMessageSchema = Joi.object({
    senderId: Joi.string().required(),
    senderModel: Joi.string().valid('User', 'Admin', 'Doctor').required(),
    receiverModel: Joi.string().valid('User', 'Admin', 'Doctor').required(),
    receiverId: Joi.string().required(),
    message: Joi.string().required(),
    notificationType: Joi.string().valid('info', 'warning', 'alert').default('info'),
});

const markAsReadSchema = Joi.object({
    notificationId: Joi.string().required(),
});
const markAsReadParamsSchema = Joi.object({
    notificationId: Joi.string().required(),
});

const getUserNotificationsSchema = Joi.object({
    receiverId: Joi.string().required(),
});

const getAdminNotificationsSchema = Joi.object({
    receiverId: Joi.string().required(),
});

const deleteNotificationSchema = Joi.object({
    notificationId: Joi.string().required(),
});

const deleteNotificationParamsSchema = Joi.object({
    notificationId: Joi.string().required(),
});

const generatePrescriptionSchema = Joi.object({
    senderId: Joi.string().required(),
    senderModel: Joi.string().valid('User', 'Admin', 'Doctor').required(),
    receiverModel: Joi.string().valid('User', 'Admin', 'Doctor').required(),
    receiverId: Joi.string().required(),
    message: Joi.string().required(),
    notificationType: Joi.string().valid('info', 'warning', 'alert').default('info'),
});


const testResultSchema = Joi.object({
    patientID: Joi.string().optional(),
    doctorID: Joi.string().optional(),
    analysis: Joi.string().optional(),
    summary: Joi.string().optional(),
    pdfText: Joi.string().optional(),
    reviewed: Joi.boolean().default(false)
});

const edittestResultSchema = Joi.object({
    analysis: Joi.string().required(),
    summary: Joi.string().required()
});

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
    [adminPathBase.me]: meSchema,
    [adminPathBase.read]: adminReadSchema,
    [adminPathBase.update]: updateAdminSchema,
    [adminPathBase.deleteAdmin]: deleteAdminSchema,
    [adminPathBase.logout]: adminLogoutSchema,
    [adminPathBase.getAllAdmins]: getAllAdminsSchema,
    [adminPathBase.getAllPatients]: getAllPatientsSchema,
    [adminPathBase.readPatient]: readPatientSchema,
    [adminPathBase.updatePatient]: updatePatientSchema,
    [adminPathBase.getDoctors]: getDoctorsSchema,
    [notificationPathBase.sendMessage]: sendMessageSchema,
    [notificationPathBase.getUserNotifications]: getUserNotificationsSchema,
    [notificationPathBase.getAdminNotifications]: getAdminNotificationsSchema,
    [notificationPathBase.markAsRead]: markAsReadSchema,
    [notificationPathBase.markAsRead + '_params']: markAsReadParamsSchema,
    [notificationPathBase.deleteNotification]: deleteNotificationSchema,
    [notificationPathBase.deleteNotification + '_params']: deleteNotificationParamsSchema,
    [notificationPathBase.generatePrescription]: generatePrescriptionSchema,
    [testresultPathBase.upload]: testResultSchema,
    [testresultPathBase.edit]: edittestResultSchema,
    '/api/feedback': feedbackSchema,
};
