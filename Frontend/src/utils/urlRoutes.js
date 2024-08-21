// const buildApiPath = (path) => `${import.meta.env.VITE_API_URL}${path}`;
const buildApiPath = (path) => path;
export const API_PATH = {
  auth: {
    login: buildApiPath('/api/auth/login'),
    register: buildApiPath('/api/auth/register'),
    read: buildApiPath('/api/auth/user/:id'),
    update: buildApiPath('/api/auth/user/:id'),
    logout: buildApiPath('/api/auth/logout'),
    getGP: buildApiPath('/api/auth/gp/:id')
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
    byclinic: (clinicId) => buildApiPath(`/api/clinics/${clinicId}/doctors`),
  },
  admin:{
    login: buildApiPath('/api/admin/login'),
    register: buildApiPath('/api/admin/register'),
    read: buildApiPath('/api/admin/:id'),
    update: buildApiPath('/api/admin/:id'),
    logout: buildApiPath('/api/admin/logout'),
    getAllAdmins: buildApiPath('/api/admin/all'),
    getAllPatients: buildApiPath('/api/patients')
  },
  images: {
    userImages: buildApiPath('/api/images/user/:id'),
    uploadImage: buildApiPath('/api/images/uploadImage')
  },
  availability: {
    getByDate: buildApiPath('/api/doctor-availability/date/:date'),
    getAll: buildApiPath('/api/doctor-availability/all/slots'),
    getByDoctor: buildApiPath('/api/doctor-availability/:doctorID')
  }
};
