import express from 'express';
import cors from 'cors';
import path from 'path';  // 新增路径模块
import authRoutes from './routes/authRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import clinicRoutes from './routes/clinicRoutes.js';
import doctorRoutes from "./routes/doctorRoutes.js";
import chatRoutes from './routes/chatRoutes.js';
import imageRoutes from "./routes/imageRoutes.js";
import adminRoutes from './routes/adminRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// 设置静态文件夹
const __dirname = path.resolve();  // 如果使用 ES6 模块，需要使用 path.resolve 来获得当前目录
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api', chatRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/admin', adminRoutes);

export default app;
