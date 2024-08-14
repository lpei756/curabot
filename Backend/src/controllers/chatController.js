import { getAppointmentsForUser, processChatWithOpenAI } from '../services/chatService.js';
import { extractUserIdFromToken } from '../middlewares/authMiddleware.js';

export const handleChat = async (req, res) => {
  try {
    const userMessage = req.body.message;
    const authToken = req.headers.authorization;

    const appointmentRequestKeywords = [
      'show my appointments',
      'list my appointments',
      'my appointments',
      'appointments',
    ];

    const bookingRequestKeywords = [
      'booking',
      'create',
    ];

    if (appointmentRequestKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      if (!authToken) {
        return res.status(401).json({ error: 'Unauthorized: No token provided. Please log in to view your appointments.' });
      }

      try {
        const userId = extractUserIdFromToken(authToken);
        const appointmentsReply = await getAppointmentsForUser(userId, authToken);
        return res.json({ reply: appointmentsReply });
      } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
    }

    if (bookingRequestKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      return res.json({
        reply: `
                Click the button to create a new appointment. Let me know if you need any assistance with your booking.
                    <a href="http://localhost:5173/appointment/new" style="display:inline-block; padding:10px 20px; font-size:16px; color:white; background-color:#03035D; text-decoration:none; border-radius:5px;">Booking</a>
                `
      });
    }

    try {
      const aiResponse = await processChatWithOpenAI(userMessage);
      res.json({ reply: aiResponse });
    } catch (error) {
      return res.status(500).json({ error: 'Error processing chat' });
    }
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
