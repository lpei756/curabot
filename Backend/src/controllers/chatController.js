import axios from 'axios';
import OpenAI from 'openai';
import jwt from 'jsonwebtoken';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handleChat = async (req, res) => {
  try {
    const userMessage = req.body.message;
    const authToken = req.headers.authorization; // Assuming the token is passed in the request headers

    if (!authToken) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    // Extract user ID from the JWT
    const userId = extractUserIdFromToken(authToken);

    // Call the chat completions method
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Ensure this model exists and is correctly named
      messages: [{ role: 'user', content: userMessage }],
    });

    const aiResponse = response.choices[0].message.content;

    // Check if the message indicates a request to list appointments
    if (userMessage.toLowerCase().includes('delete my appointment') || 
        userMessage.toLowerCase().includes('show my appointments') ||
        userMessage.toLowerCase().includes('list my appointments') ||
        aiResponse.toLowerCase().includes('delete my appointment') ||
        aiResponse.toLowerCase().includes('show my appointments') ||
        aiResponse.toLowerCase().includes('list my appointments')) {

      // Fetch the user's appointments
      const appointmentsResponse = await axios.get(`http://localhost:3001/api/appointments/${appointmentId}`, {
        headers: {
          'Authorization': authToken, // Include the token in the request headers
        },
      });

      const appointments = appointmentsResponse.data;

      if (appointments.length === 0) {
        return res.json({ reply: 'You have no appointments scheduled.' });
      }

      const appointmentList = appointments.map(appt => 
        `ID: ${appt.appointmentID}, Date: ${appt.dateTime}, Type: ${appt.typeOfVisit}`
      ).join('\n');
      
      return res.json({ reply: `Here are your appointments:\n${appointmentList}` });
    }

    res.json({ reply: aiResponse });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Helper function to extract user ID from JWT
function extractUserIdFromToken(token) {
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    // Remove 'Bearer ' prefix if present
    const tokenWithoutPrefix = token.startsWith('Bearer ') ? token.slice(7) : token;

    // Verify and decode the token
    const decoded = jwt.verify(tokenWithoutPrefix, process.env.JWT_SECRET);

    return decoded.userId; // Adjust according to your token structure
  } catch (error) {
    throw new Error('Invalid token');
  }
}