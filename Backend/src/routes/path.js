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
    create: '/appointments/create',
    read: '/appointments/:id',
    update: '/appointments/:id/update',
    delete: '/appointments/:appointmentId'
};
