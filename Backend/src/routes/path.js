export const buildPathWithBase = (paths) => {
  return Object.fromEntries(
    Object.entries(paths).map(([key, value]) => [key, `/api${value}`])
  );
};

export const ADMIN_PATHS = {
  register: '/admin/register',
  login: '/admin/login',
  me: '/admin/me',
  read: '/admin/:id',
  update: '/admin/:id',
  delete: '/admin/:id',
  logout: '/admin/logout',
  getAllAdmins: '/admin',
  getAllPatients: '/patient',
  readPatient: '/patient/:id',
  getbyPatientID: '/patientID/:patientID',
  updatePatient: '/patient/:id',
  getDoctors: '/doctors',
};

export const AUTH_PATHS = {
  register: '/register',
  login: '/login',
  user: '/user/:id',
  updateUser: '/user/:id',
  logout: '/logout',
  getGP: '/gp/:id',
  sendCode: '/send-verification-code'
};

export const APPOINTMENT_PATHS = {
  create: '/create',
  read: '/:appointmentID',
  update: '/:appointmentID/update',
  delete: '/:appointmentID',
  all: '/',
  userAppointment: '/'
};

export const CLINIC_PATHS = {
  read: '/:id',
  all: '/',
  doctor: '/:clinicId/doctors'
};

export const DOCTOR_PATHS = {
  read: '/:doctorID',
  update: '/:doctorID',
  delete: '/:doctorID',
  all: '/doctors',
  clinicDoctors: '/clinic/:clinicId/doctors',
};

export const CHAT_PATHS = {
  chat: '/chat',
};

export const IMAGE_PATHS = {
  save: '/uploadImage',
  read: '/user/:userId',
  delete: '/:imageId'
};

export const DOCTOR_AVAILABILITY_PATHS = {
  set: '/:doctorID/set',
  getByDoctor: '/:doctorID',
  getByDate: '/date/:date',
  getByAddress: '/address/:address',
  getAll: '/all/slots',
  update: '/:doctorID/slot/:slotId',
  delete: '/:doctorID/slot/:slotId',
  updateIsBooked: '/:slotId/:userId/isBooked'
};

export const NOTIFICATION_PATHS = {
  sendMessage: '/notification/send',
  getUserNotifications: '/notification/user/:userId',
  getAdminNotifications: '/notification/admin/:adminId',
  markAsRead: '/notification/:notificationId/read',
  delete: '/notification/:notificationId/delete'
};

export const TEST_RESULT_PATHS = {
  upload: '/upload',
  read: '/:testResultId',
  approve: '/:testResultId/approve',
  edit: '/:testResultId/edit',
  all: '/all/results'
};

export const PRESCRIPTION_PATHS = {
  generatePrescription: '/admin/:adminId',
  read: '/all',
  getUserPrescriptions: '/:userId',
  repeatPrescription: '/repeat',
};
