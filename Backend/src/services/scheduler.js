import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import { sendMessage } from './notificationService.js';

cron.schedule('0 * * * *', async () => {
    try {
        const now = new Date();
        const fiveHoursLater = new Date(now.getTime() + 5 * 60 * 60 * 1000);
        console.log('Checking appointments for reminders...');

        const appointments = await Appointment.find({
            dateTime: { $gte: now, $lt: fiveHoursLater },
            status: 'Scheduled'
        });

        for (const appointment of appointments) {
            const message = `Reminder: Your appointment is scheduled for ${appointment.dateTime}. Please ensure to be on time.`;
            await sendMessage({
                senderId: 'system',
                senderModel: 'System',
                receiverId: appointment.patientID,
                receiverModel: 'User',
                message: message,
                notificationType: 'Reminder',
                pdfFilePath: null
            });
        }
    } catch (error) {
        console.error('Error sending reminder notifications:', error);
    }
});
