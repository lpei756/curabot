import { getAppointmentsForAUser } from './appointmentService.js';
import { sendMessage } from './NotificationService.js';
import cron from 'node-cron';

// 定时任务，每小时执行一次
cron.schedule('0 * * * *', async () => {
    try {
        const now = new Date();
        // 获取所有用户的预约信息
        const appointments = await getAppointmentsForAUser();

        appointments.forEach(appointment => {
            const appointmentTime = new Date(appointment.dateTime);
            const diffInHours = Math.abs((appointmentTime - now) / (1000 * 60 * 60)); // 计算时间差

            // 如果预约时间在24小时内，则发送提醒
            if (diffInHours <= 24 && diffInHours > 23) {
                const messageContent = `Reminder: You have an appointment with ${appointment.assignedGP} in 24 hours.`;

                // 构建消息数据对象
                const messageData = {
                    senderId: 'system',
                    receiverId: appointment.patientID,
                    message: messageContent,
                    senderModel: "System",
                    receiverModel: "User"
                };

                // 发送消息提醒
                sendMessage(messageData, process.env.SYSTEM_TOKEN);
                console.log(`Reminder sent to user ${appointment.patientID} for appointment ${appointment._id}`);
            }
        });
    } catch (error) {
        console.error('Error occurred during cron task:', error);
    }
});
