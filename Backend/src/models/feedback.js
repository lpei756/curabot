import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true,
    },
    feedback: {
        type: Boolean,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
