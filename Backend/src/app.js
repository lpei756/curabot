import express from 'express';
import authRoutes from './routes/authRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import clinicRoutes from './routes/clinicRoutes.js';
import { handleChat } from './controllers/chatController.js';
import doctorRoutes from "./routes/doctorRoutes.js";

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/doctors', doctorRoutes);
app.post('/api/chat', handleChat);

export default app;
