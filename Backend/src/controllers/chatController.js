// controllers/chatController.js
import { getAppointmentsForUser, processChatWithOpenAI } from '../services/chatService.js';
import { extractUserIdFromToken } from '../middlewares/authMiddleware.js';

export const handleChat = async (req, res) => {
  try {
    const userMessage = req.body.message;
    const authToken = req.headers.authorization;

    if (!authToken) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const userId = extractUserIdFromToken(authToken);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const appointmentRequestKeywords = [
      'show my appointments',
      'list my appointments',
      'my appointments',
      'appointments',
    ];

    if (appointmentRequestKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      const appointmentsReply = await getAppointmentsForUser(userId, authToken);
      return res.json({ reply: appointmentsReply });
    }

    const aiResponse = await processChatWithOpenAI(userMessage);
    res.json({ reply: aiResponse });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};