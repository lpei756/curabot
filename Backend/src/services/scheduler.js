import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendMessage } from './notificationService.js';

cron.schedule('0 * * * *', async () => {
    try {
        const now = new Date();
        const fiveHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        console.log(`Current time: ${now}`);
        console.log(`Checking for appointments between now and ${fiveHoursLater}`);
        const appointments = await Appointment.find({
            dateTime: { $gte: now, $lt: fiveHoursLater },
            status: 'Scheduled'
        });
        console.log(`Found ${appointments.length} appointments requiring reminders.`);
        const patientIds = appointments.map(appointment => appointment.patientID);
        const users = await User.find({ patientID: { $in: patientIds } });
        for (const appointment of appointments) {
            const user = users.find(u => u.patientID === appointment.patientID);
            if (!user) {
                console.error(`User not found for patientID: ${appointment.patientID}`);
                continue;
            }
            console.log(`Processing appointmentID: ${appointment.appointmentID} for patientID: ${appointment.patientID}`);
            if (!appointment.appointmentID || appointment.appointmentID.trim() === "") {
                console.error(`Invalid or missing appointmentID for appointment: ${appointment._id}`);
                continue;
            }
            const message = `Reminder: Your appointment (ID: ${appointment.appointmentID}) is scheduled for ${appointment.dateTime}. Please ensure to be on time.`;
            console.log(`Checking if reminder already sent for appointment ID: ${appointment.appointmentID} to patient ID: ${appointment.patientID}`);
            const existingReminder = await Notification.findOne({
                receiver: user._id,
                notificationType: 'Reminder',
                appointmentID: appointment.appointmentID.toString()
            });
            if (!existingReminder) {
                console.log(`AppointmentID before sending message: ${appointment.appointmentID}`);
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
                console.log(`Reminder sent successfully for appointment ID: ${appointment.appointmentID} to patient ID: ${appointment.patientID}`);
            } else {
                console.log(`Reminder already sent for appointment ID: ${appointment.appointmentID} to patient ID: ${appointment.patientID}, skipping.`);
            }
        }
    } catch (error) {
        console.error(`Error sending reminder notifications: ${error.message}`, error);
    }
});
