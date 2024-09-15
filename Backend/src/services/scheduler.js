import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import { sendMessage } from './notificationService.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';  // 假设 User 模型存在

cron.schedule('* * * * *', async () => {  // 每分钟执行一次，方便测试
    try {
        const now = new Date();
        const fiveHoursLater = new Date(now.getTime() + 5 * 60 * 60 * 1000);  // 当前时间 + 5小时
        console.log(`Current time: ${now}`);
        console.log(`Checking for appointments between now and ${fiveHoursLater}`);

        // 查找在接下来的5小时内即将进行的预约
        const appointments = await Appointment.find({
            dateTime: { $gte: now, $lt: fiveHoursLater },
            status: 'Scheduled'
        });

        console.log(`Found ${appointments.length} appointments requiring reminders.`);

        // 遍历找到的预约并发送提醒
        for (const appointment of appointments) {
            const message = `Reminder: Your appointment is scheduled for ${appointment.dateTime}. Please ensure to be on time.`;

            console.log(`Checking if reminder already sent to patient ID: ${appointment.patientID}`);

            // 首先确保我们有患者的 ObjectId
            const user = await User.findOne({ patientID: appointment.patientID });
            if (!user) {
                console.error(`User not found with patientID: ${appointment.patientID}`);
                continue;  // 如果找不到用户，跳过该提醒
            }

            // 检查是否已经发送过相同的提醒
            const existingReminder = await Notification.findOne({
                receiver: user._id,  // 使用 ObjectId 作为 receiver
                notificationType: 'Reminder',
                message: message,
            });

            if (!existingReminder) {
                console.log(`Sending reminder to patient ID: ${appointment.patientID}`);

                await sendMessage({
                    senderId: 'system',
                    senderModel: 'System',
                    receiverId: user._id,  // 使用 ObjectId
                    receiverModel: 'User',
                    message: message,
                    notificationType: 'Reminder',
                    pdfFilePath: null  // 无PDF文件
                });

                console.log(`Reminder sent successfully to patient ID: ${appointment.patientID}`);
            } else {
                console.log(`Reminder already sent to patient ID: ${appointment.patientID}, skipping.`);
            }
        }

    } catch (error) {
        console.error(`Error sending reminder notifications: ${error.message}`, error);
    }
});
