export const buildPathWithBase = (paths) => {
  return Object.fromEntries(
    Object.entries(paths).map(([key, value]) => [key, `/api${value}`])
  );
};

export const AUTH_PATHS = {
  register: '/register',
  login: '/login',
  user: '/user',
  updateUser: '/user/:id',
  logout: '/user/:id/logout'
};

export const APPOINTMENT_PATHS = {
  create: '/appointments/create'
};
