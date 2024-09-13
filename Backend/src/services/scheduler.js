import { getAppointmentsForUser } from './appointmentService.js';
import { sendMessage } from './NotificationService.js';
import cron from 'node-cron';
import FormData from 'form-data';

cron.schedule('0 * * * *', async () => {
    const now = new Date();
    const appointments = await getAppointmentsForUser();

    appointments.forEach(appointment => {
        const appointmentTime = new Date(appointment.dateTime);
        const diffInHours = Math.abs((appointmentTime - now) / (1000 * 60 * 60));

        if (diffInHours <= 24 && diffInHours > 23) {
            const messageContent = `Reminder: You have an appointment with ${appointment.assignedGP} in 24 hours.`;
            const formData = new FormData();
            formData.append('senderId', 'system');
            formData.append('receiverId', appointment.patientID);
            formData.append('message', messageContent);
            formData.append('senderModel', "System");
            formData.append('receiverModel', "User");

            sendMessage(formData, process.env.SYSTEM_TOKEN);
            console.log(`Reminder sent to user ${appointment.patientID} for appointment ${appointment._id}`);
        }
    });
});
