import mongoose from 'mongoose';
import { getAppointmentsForAUser } from '../src/services/appointmentService.js';
import { sendMessage } from '../src/services/NotificationService.js';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';

dotenv.config({ path: './Backend/.env' });

console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

async function testReminderFunction() {
    const now = new Date();
    console.log("Current time is:", now);

    try {
        const appointments = await getAppointmentsForAUser();
        console.log("Fetched appointments:", appointments);

        appointments.forEach(async (appointment) => {
            const appointmentTime = new Date(appointment.dateTime);
            const diffInHours = Math.abs((appointmentTime - now) / (1000 * 60 * 60));
            console.log(`Time difference in hours for appointment ${appointment._id}:`, diffInHours);

            if (diffInHours <= 5 && diffInHours > 0) {
                console.log(`Appointment ${appointment._id} is within the 5-hour window.`);
                const messageContent = `Reminder: You have an appointment with ${appointment.doctorName} in 5 hours.`;

                // 将 patientID 转换为 ObjectId 类型，确保符合 Mongoose 的模型定义
                let receiverId;
                try {
                    receiverId = new ObjectId(appointment.patientID);
                } catch (error) {
                    console.error(`Invalid ObjectId for receiverId: ${appointment.patientID}`, error);
                    return;  // 如果 ObjectId 无效，则跳过此条消息
                }

                const messageData = {
                    senderId: new ObjectId('system'),  // 假设'system'是有效的 ObjectId，根据实际情况替换
                    receiverId: receiverId,
                    message: messageContent,
                    senderModel: "System",
                    receiverModel: "User"
                };

                try {
                    console.log('Sending message:', messageData);
                    await sendMessage(messageData);  // 调用sendMessage函数
                    console.log(`Reminder sent to user ${appointment.patientID} for appointment ${appointment._id}`);
                } catch (error) {
                    console.error(`Failed to send reminder to user ${appointment.patientID}:`, error);
                }
            } else {
                console.log(`Appointment ${appointment._id} is not within the 5-hour window.`);
            }
        });
    } catch (error) {
        console.error("Error occurred during fetching appointments or sending reminders:", error);
    }
}

// 连接 MongoDB 并运行提醒函数
mongoose.connect(process.env.MONGO_URI, {
    connectTimeoutMS: 30000,  // 设置连接超时为30秒
    socketTimeoutMS: 45000  // 设置socket超时为45秒
}).then(() => {
    console.log('MongoDB connected successfully');
    testReminderFunction();  // 在连接成功后运行提醒函数
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});
