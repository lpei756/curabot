import { getAppointmentsForUser, processChatWithOpenAI } from '../services/chatService.js';
import { extractUserIdFromToken } from '../middlewares/authMiddleware.js';
import { getAllAvailableSlots,  findNearestSlot } from '../services/doctorAvailabilityService.js';

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
      'create',
    ];

    const autoAppointmentKeywords = [
      'schedule appointment',
      'book appointment',
      'find available slot',
      'auto appointment',
      'booking'
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

    
    if (autoAppointmentKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      if (!authToken) {
        return res.status(401).json({ error: 'Unauthorized: No token provided. Please log in to schedule an appointment.' });
      }
    
      try {
        const availableSlots = await getAllAvailableSlots();

        if (!availableSlots || availableSlots.length === 0) {
          console.log('No slots returned from getAllAvailableSlots');
          return res.json({
            reply: 'Sorry, there are no available slots at the moment. Please try again later.'
          });
        }

        const nearestSlot = findNearestSlot(availableSlots);
    
        if (!nearestSlot) {
          return res.json({
            reply: 'Sorry, there are no available slots at the moment. Please try again later.'
          });
        }
    
        return res.json({
          reply: `
            I found an available slot for you. Would you like to book it?
            <p><strong>Date:</strong> ${nearestSlot.date}</p>
            <a href="http://localhost:5173/appointment/book/${nearestSlot._id}" style="display:inline-block; padding:10px 20px; font-size:16px; color:white; background-color:#03035D; text-decoration:none; border-radius:5px;">Book Now</a>
          `
        });
      } catch (error) {
        console.error('Error fetching or processing available slots:', error);
        return res.status(500).json({ error: 'Error fetching available slots' });
      }
    }

    try {
      const aiResponse = await processChatWithOpenAI(userMessage);
      return res.json({ reply: aiResponse });
    } catch (error) {
      return res.status(500).json({ error: 'Error processing chat' });
    }
  } catch (error) {
    console.error('Error processing chat:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
