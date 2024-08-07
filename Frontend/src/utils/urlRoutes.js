const buildApiPath = (path) => `${import.meta.env.VITE_API_URL}${path}`;

// API and application path constants
export const API_PATH = {
  auth: {
    login: buildApiPath('/api/auth/login'),
    signup: buildApiPath('/api/auth/register')
  }
};
