import axios from 'axios';
import OpenAI from 'openai';
import jwt from 'jsonwebtoken';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the extractUserIdFromToken function
function extractUserIdFromToken(token) {
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const tokenWithoutPrefix = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt.verify(tokenWithoutPrefix, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded); // Log token content for debugging
    return decoded.user._id; // Access user._id from the token payload
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export const handleChat = async (req, res) => {
  try {
    const userMessage = req.body.message;
    const authToken = req.headers.authorization; // Assuming the token is passed in the request headers

    if (!authToken) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const userId = extractUserIdFromToken(authToken);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Ensure this model exists and is correctly named
      messages: [{ role: 'user', content: userMessage }],
    });

    const aiResponse = response.choices[0].message.content;

    console.log('User Message:', userMessage);
    console.log('AI Response:', aiResponse);

    const appointmentRequestKeywords = [
      'show my appointments',
      'list my appointments',
      'my appointments',
      'appointments',
    ];

    if (appointmentRequestKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword) ||
        aiResponse.toLowerCase().includes(keyword))) {

      console.log('Fetching appointments for user:', userId);

      const userResponse = await axios.get(`http://localhost:3001/api/auth/user/${userId}`, {
        headers: {
          'Authorization': authToken,
        },
      });

      console.log('User Data Response:', userResponse.data);

      const user = userResponse.data;
      const appointments = user.appointments || [];

      if (appointments.length === 0) {
        return res.json({ reply: 'You have no appointments scheduled.' });
      }

      const appointmentList = appointments.map(appt => 
        `ID: ${appt.appointmentID}, Date: ${new Date(appt.date).toLocaleDateString()}`
      ).join('\n');
      
      return res.json({ reply: `Here are your appointments:\n${appointmentList}` });
    }

    res.json({ reply: aiResponse });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};