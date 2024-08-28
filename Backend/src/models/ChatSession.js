import mongoose from 'mongoose';

const ChatSessionSchema = new mongoose.Schema({
    _id: { type: String, required: true },  // Use sessionId as _id
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    messages: [
      {
        sender: { type: String, required: true },
        message: { type: String, required: true },
        isAnonymous: { type: Boolean, default: false },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  });
  
  const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);
  
  export default ChatSession;