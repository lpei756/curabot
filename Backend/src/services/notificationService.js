import mongoose from 'mongoose';
import Grid from 'gridfs-stream';
import multer from 'multer';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Doctor from '../models/Doctor.js';
const conn = mongoose.connection;

let gfs;

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
    console.log('GridFS initialized for PDF storage');
});

export const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            console.log('Setting upload destination');
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            console.log('Generating file name:', Date.now() + '-' + file.originalname);
            cb(null, Date.now() + '-' + file.originalname);
        }
    }),
    fileFilter: (req, file, cb) => {
        console.log('File filter:', file.mimetype);
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Not a PDF file!'), false);
        }
    }
}).single('pdfFile');


export const getNotifications = async (receiverId, receiverModel) => {
    try {
        console.log(`Fetching notifications for ${receiverModel} with ID: ${receiverId}`);
        const notifications = await Notification.find({ receiver: receiverId, receiverModel }).sort({ date: -1 });
        console.log(`Notifications fetched successfully, found ${notifications.length} notifications.`);
        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        throw error;
    }
};

const getUserOrAdmin = async (id, model) => {
    console.log(`Fetching ${model} with ID: ${id}`);
    let result;
    try {
        if (model === 'Doctor') {
            result = await Admin.findOne({ _id: id, role: 'doctor' });
            if (!result) {
                result = await Doctor.findById(id);
            }
        } else if (model === 'User') {
            // 检查 ID 是否为合法的 ObjectId，如果不是，则使用 patientID 进行查找
            if (mongoose.Types.ObjectId.isValid(id)) {
                result = await User.findById(id);  // 直接通过 _id 查找用户
            } else {
                result = await User.findOne({ patientID: id });  // 使用 patientID 查找
            }

            if (!result) {
                throw new Error(`User with ID ${id} not found`);
            }
        } else if (model === 'Admin') {
            result = await Admin.findById(id);
        } else {
            console.error(`Unknown model: ${model}`);
            return null;
        }
        if (!result) {
            console.error(`${model} with ID: ${id} not found`);
        } else {
            console.log(`${model} found:`, result);
        }
        return result;
    } catch (error) {
        console.error(`Error fetching ${model} with ID ${id}:`, error.message);
        throw new Error(`Error fetching ${model} with ID ${id}`);
    }
};

export const sendMessage = async ({ senderId, senderModel, receiverId, receiverModel, message, notificationType, pdfFilePath }) => {
    let senderName;

    // 如果 senderId 是 'system'，允许 sender 为 'system' 或 null
    if (senderId === 'system') {
        senderName = 'System';
        senderId = null;  // 或者直接将 sender 设置为 'system'
    } else {
        // 获取发送者的名称
        const sender = await getUserOrAdmin(senderId, senderModel);
        if (!sender) {
            throw new Error('Sender not found');
        }
        senderName = `${sender.firstName} ${sender.lastName}`;
    }

    // 检查并转换 receiverId 为合法的 ObjectId
    let receiverObjectId = receiverId;
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        receiverObjectId = new mongoose.Types.ObjectId(receiverId);  // 转换为 ObjectId
    }

    // 获取接收者的名称
    const receiver = await getUserOrAdmin(receiverObjectId, receiverModel);
    if (!receiver) {
        throw new Error('Receiver not found');
    }

    const receiverName = `${receiver.firstName} ${receiver.lastName}`;

    // 创建通知对象
    const notification = new Notification({
        sender: senderId === 'system' ? 'system' : senderId,
        senderModel,
        senderName,
        receiver: receiverObjectId,  // 确保是 ObjectId 类型
        receiverModel,
        receiverName,
        message,
        isRead: false,
        date: new Date(),
        notificationType,
        pdfFile: pdfFilePath
    });

    // 保存通知
    await notification.save();
    return notification;
};

export const markAsRead = async (notificationId) => {
    try {
        console.log('Marking notification as read with ID:', notificationId);

        const notification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
        if (!notification) {
            console.error('Notification not found with ID:', notificationId);
            throw new Error('Notification not found');
        }

        console.log('Notification marked as read:', notification);
        return notification;
    } catch (error) {
        console.error('Error marking notification as read:', error.message);
        throw error;
    }
};

export const deleteNotification = async (notificationId) => {
    try {
        console.log('Deleting notification with ID:', notificationId);
        const notification = await Notification.findByIdAndDelete(notificationId);
        if (!notification) {
            console.error('Notification not found with ID:', notificationId);
            throw new Error('Notification not found');
        }
        if (notification.pdfFile) {
            const filename = notification.pdfFile.split('/').pop();
            gfs.remove({ filename, root: 'uploads' }, (err) => {
                if (err) {
                    console.error(`Error deleting PDF file from GridFS: ${err.message}`);
                    throw new Error(`Error deleting PDF file from GridFS: ${err.message}`);
                }
                console.log('PDF file deleted successfully from GridFS');
            });
        }
        console.log('Notification deleted successfully:', notification);
        return notification;
    } catch (error) {
        console.error('Error deleting notification:', error.message);
        throw error;
    }
};
