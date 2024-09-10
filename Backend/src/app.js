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
import prescriptionsRoutes from './routes/prescriptionRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js';
import doctorAvailabilityRoutes from './routes/doctorAvailabilityRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import testresultRoutes from './routes/testResultRoutes.js';
import cron from 'node-cron';
import { deleteOldChatHistories } from './services/cleanUpService.js';

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api', chatRoutes);
app.use('/api/images', imageRoutes);
app.use('/api', adminRoutes);
app.use('/api', notificationRoutes);
app.use('/api/doctor-availability', doctorAvailabilityRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/test-result', testresultRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);

app.post('/api/feedback', (req, res) => {
    const { messageId, feedback } = req.body;
    console.log(`Received feedback for message ${messageId}: ${feedback}`);

    res.status(200).send({ status: 'success', message: 'Feedback received' });
});

cron.schedule('0 0 * * *', () => {
    console.log('Running the chat history cleanup...');
    deleteOldChatHistories();
  });  

export default app;
