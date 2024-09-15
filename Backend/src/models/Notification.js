import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.Mixed, refPath: 'senderModel', required: true },
    // sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, refPath: 'receiverModel', required: true },
    senderModel: { type: String, required: true, enum: ['User', 'Doctor', 'Admin', 'System'] },
    receiverModel: { type: String, required: true, enum: ['User', 'Doctor', 'Admin'] },

    senderName: { type: String, required: true },
    receiverName: { type: String, required: true },

    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
    notificationType: {
        type: String,
        enum: ['info', 'warning', 'alert', 'prescription', 'Reminder'],
        default: 'info',
    },
    pdfFile: { type: String, required: false },
});

NotificationSchema.pre('save', function (next) {
    // 如果 senderModel 是 'System'，允许 sender 为 null 或 'system'
    if (this.senderModel === 'System') {
        this.sender = 'system';
    } else if (!mongoose.isValidObjectId(this.sender)) {
        return next(new Error('Sender must be a valid ObjectId'));
    }

    // 验证 receiver 是否为有效的 ObjectId
    if (!mongoose.isValidObjectId(this.receiver)) {
        return next(new Error('Receiver must be a valid ObjectId'));
    }
    next();
});



const NotificationModel = mongoose.model('Notification', NotificationSchema);
export default NotificationModel;
