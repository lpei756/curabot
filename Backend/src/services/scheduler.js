import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendMessage } from './notificationService.js';

cron.schedule('0 * * * *', async () => {
    try {
        const now = new Date();
        const fiveHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const appointments = await Appointment.find({
            dateTime: { $gte: now, $lt: fiveHoursLater },
            status: 'Scheduled'
        });
        const patientIds = appointments.map(appointment => appointment.patientID);
        const users = await User.find({ patientID: { $in: patientIds } });
        for (const appointment of appointments) {
            const user = users.find(u => u.patientID === appointment.patientID);
            if (!user) {
                console.error(`User not found for patientID: ${appointment.patientID}`);
                continue;
            }
            if (!appointment.appointmentID || appointment.appointmentID.trim() === "") {
                console.error(`Invalid or missing appointmentID for appointment: ${appointment._id}`);
                continue;
            }
            const message = `Reminder: Your appointment (ID: ${appointment.appointmentID}) is scheduled for ${appointment.dateTime}. Please ensure to be on time.`;
            const existingReminder = await Notification.findOne({
                receiver: user._id,
                notificationType: 'Reminder',
                appointmentID: appointment.appointmentID.toString()
            });
            if (!existingReminder) {
                await sendMessage({
                    senderId: 'system',
                    senderModel: 'System',
                    receiverId: user._id,
                    receiverModel: 'User',
                    message: message,
                    notificationType: 'Reminder',
                    appointmentID: appointment.appointmentID.toString(),
                    pdfFilePath: null
                });
            } else {
            }
        }
    } catch (error) {
        console.error(`Error sending reminder notifications: ${error.message}`, error);
    }
});
