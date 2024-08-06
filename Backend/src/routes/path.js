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
    read: '/:id',
    update: '/:id/update',
    delete: '/:appointmentId'
};

export const CLINIC_PATHS = {
  read: '/:id'
};

export const DOCTOR_PATHS = {
    read: '/:id'
};
