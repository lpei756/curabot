// path.js contains all the paths for the backend routes. This file is used to keep track of all the paths in one place.

export const buildPathWithBase = (paths) => {
    return Object.fromEntries(
      Object.entries(paths).map(([key, value]) => [key, `/api/auth${value}`])
    );
  };

export const AUTH_PATHS = {
    register: '/register',
    login: '/login',
    user: '/user/:id',
    updateUser: '/user/:id',
    logout: '/user/:id/logout'
  };


