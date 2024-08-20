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
  logout: '/logout',
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
  read: '/:doctorID',                 // 获取单个医生的信息
  doctorRegister: '/doctors/register',// 医生注册
  doctorLogin: '/doctors/login',       // 医生登录
  update: '/:doctorID',               // 更新医生信息
  delete: '/:doctorID',               // 删除医生
  all: '/doctors',                           // 获取所有医生
  clinicDoctors: '/clinic/:clinicId/doctors',  // 获取指定诊所的医生列表
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

export const DOCTOR_AVAILABILITY_PATHS = {
  set: '/:doctorID/set',
  getByDoctor: '/:doctorID',
  getByDate: '/date/:date',
  getByAddress: '/address/:address',
  update: '/:doctorID/slot/:slotId',
  delete: '/:doctorID/slot/:slotId'
};
