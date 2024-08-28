import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, refPath: 'receiverModel', required: true },
    senderModel: { type: String, required: true, enum: ['User', 'Doctor', 'Admin'] },
    receiverModel: { type: String, required: true, enum: ['User', 'Doctor', 'Admin'] },
    senderName: { type: String, required: true },
    receiverName: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
    notificationType: {
        type: String,
        enum: ['info', 'warning', 'alert'],
        default: 'info',
    },
});

NotificationSchema.pre('save', function (next) {
    next();
});

const NotificationModel = mongoose.model('Notification', NotificationSchema);
export default NotificationModel;
