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
            if (mongoose.Types.ObjectId.isValid(id)) {
                result = await User.findById(id);
            } else {
                result = await User.findOne({ patientID: id });
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

export const sendMessage = async ({
                                      senderId,
                                      senderModel,
                                      receiverId,
                                      receiverModel,
                                      message,
                                      notificationType,
                                      appointmentID,
                                      pdfFilePath
                                  }) => {
    console.log(`Inside sendMessage: notificationType is ${notificationType}`);
    let senderName;
    if (senderId === 'system') {
        senderName = 'System';
        senderId = null;
    } else {
        const sender = await getUserOrAdmin(senderId, senderModel);
        if (!sender) {
            throw new Error('Sender not found');
        }
        senderName = `${sender.firstName} ${sender.lastName}`;
    }
    let receiverObjectId;
    if (mongoose.Types.ObjectId.isValid(receiverId)) {
        receiverObjectId = new mongoose.Types.ObjectId(receiverId);
    } else {
        const user = await User.findOne({ patientID: receiverId });
        if (!user) {
            throw new Error('Receiver not found with patientID');
        }
        receiverObjectId = user._id;
    }
    const receiver = await getUserOrAdmin(receiverObjectId, receiverModel);
    if (!receiver) {
        throw new Error('Receiver not found');
    }
    const receiverName = `${receiver.firstName} ${receiver.lastName}`;
    const notificationData = {
        sender: senderId,
        senderModel,
        senderName,
        receiver: receiverObjectId,
        receiverModel,
        receiverName,
        message,
        isRead: false,
        date: new Date(),
        notificationType,
        pdfFile: pdfFilePath
    };
    if (!appointmentID || appointmentID.trim() === "") {
        appointmentID = `AUTO-${new Date().getTime()}`;
    }
    notificationData.appointmentID = appointmentID;
    const notification = new Notification(notificationData);
    try {
        await notification.save();
        console.log('Notification saved successfully.');
        return notification;
    } catch (error) {
        console.error(`Failed to save notification: ${error.message}`);
        throw error;
    }
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
