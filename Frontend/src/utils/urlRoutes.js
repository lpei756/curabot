const buildApiPath = (path) => `${import.meta.env.VITE_API_URL}${path}`;

export const API_PATH = {
  admin: {
    login: buildApiPath('/api/admin/login'),
    register: buildApiPath('/api/admin/register'),
    read: buildApiPath('/api/admin/:id'),
    me: buildApiPath('/api/admin/me'),
    update: buildApiPath('/api/admin/:id'),
    delete: buildApiPath('/api/admin/:id'),
    logout: buildApiPath('/api/admin/logout'),
    getAllAdmins: buildApiPath('/api/admin'),
    getAllPatients: buildApiPath('/api/patient'),
    getbyPatientID: buildApiPath('/api/patientID/:patientID'),
    readPatient: buildApiPath('/api/patient/:id'),
    updatePatient: buildApiPath('/api/patient/:id'),
    getDoctors: buildApiPath('/api/doctors'),
  },
  auth: {
    login: buildApiPath('/api/auth/login'),
    register: buildApiPath('/api/auth/register'),
    read: buildApiPath('/api/auth/user/:id'),
    update: buildApiPath('/api/auth/user/:id'),
    logout: buildApiPath('/api/auth/logout'),
    getGP: buildApiPath('/api/auth/gp/:id'),
    sendCode: buildApiPath('/api/auth/send-verification-code')
  },
  appointment: {
    create: buildApiPath('/api/appointments/create'),
    delete: buildApiPath('/api/appointments/:id'),
    read: buildApiPath('/api/appointments/:id'),
    update: buildApiPath('/api/appointments/:id'),
    all: buildApiPath('/api/appointments')
  },
  chat: {
    send: buildApiPath('/api/chat'),
    feedback: buildApiPath('/api/feedback'),
    history: buildApiPath('/api/chat/history/${sessionId}'),
    userHistory: buildApiPath('/api/chat/user/${userId}/history'),

  },
  notification: {
    sendMessage: buildApiPath('/api/notification/send'),
    getUserNotifications: buildApiPath('/api/notification/user/:userId'),
    getAdminNotifications: buildApiPath('/api/notification/admin/:adminId'),
    markAsRead: buildApiPath('/api/notification/:notificationId/read'),
    delete: buildApiPath('/api/notification/:notificationId/delete'),
  },
  clinic: {
    all: buildApiPath('/api/clinics'),
    read: buildApiPath('/api/clinics/:clinicId')
  },
  doctor:{
    byclinic: (clinicId) => buildApiPath(`/api/clinics/${clinicId}/doctors`),
    read: buildApiPath('/api/doctors/:doctorID')
  },
  images: {
    userImages: buildApiPath('/api/images/user/:id'),
    uploadImage: buildApiPath('/api/images/uploadImage')
  },
  availability: {
    getByDate: buildApiPath('/api/doctor-availability/date/:date'),
    getAll: buildApiPath('/api/doctor-availability/all/slots'),
    getByDoctor: buildApiPath('/api/doctor-availability/:doctorID'),
    getByAddress: buildApiPath('/api/doctor-availability/address/:address'),
    updateIsBooked: buildApiPath('/api/doctor-availability/:slotId/:userId/isBooked')
  },
  testresult: {
    getAll: buildApiPath('/api/test-result/all/results'),
    get: buildApiPath('/api/test-result/:testResultId'),
    edit: buildApiPath('/api/test-result/:testResultId/edit'),
    approve: buildApiPath('/api/test-result/:testResultId/approve')
  },
  prescriptions: {
    generatePrescription: buildApiPath('/api/prescriptions/admin/:adminId'),
    getAll: buildApiPath('/api/prescriptions/all'),
    getUserPrescriptions: buildApiPath('/api/prescriptions/:userId'),
    repeatPrescription: buildApiPath('/api/prescriptions/repeat')
  }
};
