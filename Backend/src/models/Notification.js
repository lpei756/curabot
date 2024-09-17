import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.Mixed, refPath: 'senderModel', required: false },
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
        enum: ['info', 'warning', 'alert', 'prescription', 'Reminder', 'appointment_update', 'appointment_cancelled'],
        default: 'info',
    },
    appointmentID: { type: String, default: '' },
    pdfFile: { type: String, required: false },
});

NotificationSchema.index(
    { receiver: 1, appointmentID: 1 },
    {
        unique: true,
        partialFilterExpression: { appointmentID: { $ne: "" } }
    }
);

NotificationSchema.pre('save', function (next) {
    console.log('Preparing to save Notification:');
    console.log(`SenderModel: ${this.senderModel}, Receiver: ${this.receiver}, AppointmentID: ${this.appointmentID}, NotificationType: ${this.notificationType}`);
    if (this.senderModel === 'System') {
        this.sender = 'system';
    } else if (!mongoose.isValidObjectId(this.sender)) {
        return next(new Error('Sender must be a valid ObjectId'));
    }
    if (!mongoose.isValidObjectId(this.receiver)) {
        return next(new Error('Receiver must be a valid ObjectId'));
    }
    if (this.notificationType === 'Reminder' && (!this.appointmentID || this.appointmentID.trim() === "")) {
        return next(new Error('Reminder notifications must have a valid appointmentID'));
    }
    next();
});

const NotificationModel = mongoose.model('Notification', NotificationSchema);
export default NotificationModel;
