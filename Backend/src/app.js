import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import clinicRoutes from './routes/clinicRoutes.js';
import doctorRoutes from "./routes/doctorRoutes.js";
import chatRoutes from './routes/chatRoutes.js';
import imageRoutes from "./routes/imageRoutes.js";
import adminRoutes from './routes/adminRoutes.js';
import doctorAvailabilityRoutes from './routes/doctorAvailabilityRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());


const __dirname = path.resolve();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api', chatRoutes);
app.use('/api/images', imageRoutes);
console.log('Registering admin routes...');
app.use('/api', adminRoutes);
console.log('Admin routes registered.');
app.use('/api/doctor-availability', doctorAvailabilityRoutes);

app.post('/api/feedback', (req, res) => {
    const { messageId, feedback } = req.body;
    console.log(`Received feedback for message ${messageId}: ${feedback}`);

    res.status(200).send({ status: 'success', message: 'Feedback received' });
});

export default app;
