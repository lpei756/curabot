import mongoose from 'mongoose';

const ChatHistorySchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userId: { type: String }, // Optional, if logged in
  message: { type: String, required: true },
  sender: { type: String, enum: ['user', 'bot'], required: true },
  timestamp: { type: Date, default: Date.now },
  isAnonymous: { type: Boolean, default: true }
});

const ChatHistory = mongoose.model('ChatHistory', ChatHistorySchema);

export default ChatHistory;
