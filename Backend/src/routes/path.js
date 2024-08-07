export const buildPathWithBase = (paths) => {
  return Object.fromEntries(
      Object.entries(paths).map(([key, value]) => [key, `/api${value}`])
  );
};

export const AUTH_PATHS = buildPathWithBase({
  register: '/register',
  login: '/login',
  user: '/user/:id',
  updateUser: '/user/:id',
  logout: '/logout'
});

export const APPOINTMENT_PATHS = buildPathWithBase({
  create: '/create',
  read: '/:id',
  update: '/:id/update',
  delete: '/:appointmentId'
});

export const CLINIC_PATHS = buildPathWithBase({
  read: '/:id',
  all: '/'
});

export const DOCTOR_PATHS = buildPathWithBase({
  read: '/:id'
});

export const CHAT_PATHS = buildPathWithBase({
  chat: '/chat',
});

export const IMAGE_PATHS = buildPathWithBase({
  save: '/uploadImage',
  read: '/user/:userId',
  delete: '/:imageId'
});
