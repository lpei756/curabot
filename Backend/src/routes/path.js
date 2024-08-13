export const buildPathWithBase = (paths) => {
  return Object.fromEntries(
      Object.entries(paths).map(([key, value]) => [key, `/api${value}`])
  );
};

export const AUTH_PATHS = {
  register: '/register',
  login: '/login',
  user: '/user/:id',
  updateUser: '/user/:id',
  logout: '/logout'
};

export const APPOINTMENT_PATHS = {
  create: '/create',
  read: '/:appointmentID',
  update: '/:appointmentID/update',
  delete: '/:appointmentID',
  all: '/'
};

export const CLINIC_PATHS = {
  read: '/:id',
  all: '/',
  doctor: '/:clinicId/doctors'
};

export const DOCTOR_PATHS = {
  read: '/:doctorID'
};

export const CHAT_PATHS = {
  chat: '/chat',
};

export const IMAGE_PATHS = {
  save: '/uploadImage',
  read: '/user/:userId',
  delete: '/:imageId'
};

export const ADMIN_PATHS = {
  getAllPatients: '/patients'
};