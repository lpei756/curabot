const buildApiPath = (path) => `${import.meta.env.VITE_API_URL}${path}`;

export const API_PATH = {
  auth: {
    login: buildApiPath('/api/auth/login'),
    register: buildApiPath('/api/auth/register'),
    read: buildApiPath('/api/auth/user/:id'),
    update: buildApiPath('/api/auth/user/:id'),
    logout: buildApiPath('/api/auth/logout')
  },
  appointment: {
    create: buildApiPath('/api/appointments/create'),
    delete: buildApiPath('/api/appointments/:id'),
    read: buildApiPath('/api/appointments/:id'),
    update: buildApiPath('/api/appointments/:id'),
    all: buildApiPath('/api/appointments')
  },
  chat: {
    send: buildApiPath('/api/chat')
  },
  clinic: {
    all: buildApiPath('/api/clinics')
  },
  doctor:{
    byclinic: (clinicId) => buildApiPath(`/api/clinics/${clinicId}/doctors`)
  },
  images: {
    userImages: buildApiPath('/api/images/user/:id'),
    uploadImage: buildApiPath('/api/images/uploadImage')
  }
};
