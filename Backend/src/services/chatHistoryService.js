import ChatHistory from '../models/ChatHistory.js';

export const saveChatMessage = async ({ sessionId, userId, message, sender, isAnonymous }) => {
  try {
    const chatMessage = new ChatHistory({
      sessionId,
      userId,
      message,
      sender,
      isAnonymous
    });

    await chatMessage.save();
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
};
