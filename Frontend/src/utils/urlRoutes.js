const buildApiPath = (path) => `${import.meta.env.VITE_API_URL}${path}`;

// API and application path constants
export const API_PATH = {
  auth: {
    login: buildApiPath('/api/auth/login'),
    signup: buildApiPath('/api/auth/register'),
    read: buildApiPath('/api/auth/user/:id'),
    update: buildApiPath('/api/auth/user/:id'),
    logout: buildApiPath('/api/auth/logout')
  },
  appointment: {
    create: buildApiPath('/api/appointments/create'),
    delete: buildApiPath('/api/appointments/:id'),
    read: buildApiPath('/api/auth/appointments/:id'),
    update: buildApiPath('/api/auth/appointments/:id')
  }
};
