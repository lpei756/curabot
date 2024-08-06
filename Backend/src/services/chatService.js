// services/chatService.js
import axios from 'axios';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getAppointmentsForUser = async (userId, authToken) => {
  try {
    const userResponse = await axios.get(`http://localhost:3001/api/auth/user/${userId}`, {
      headers: {
        'Authorization': authToken,
      },
    });

    const user = userResponse.data.user;
    const appointments = user.appointments || [];

    if (appointments.length === 0) {
      return 'You have no appointments scheduled.';
    }

    const appointmentList = appointments.map(appt => {
      const dateStr = appt.date.$date || appt.date;
      const date = new Date(dateStr);
      const formattedDate = !isNaN(date.getTime()) ? date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) : "Invalid Date";
      return `ID: ${appt.appointmentID}, Date: ${formattedDate}`;
    }).join('\n');

    return `Here are your appointments:\n${appointmentList}\nLet me know if you would like to make an appointment, update an appointment, or delete an appointment.`;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw new Error('Error fetching user data');
  }
};

export const processChatWithOpenAI = async (userMessage) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: userMessage }],
  });

  return response.choices[0].message.content;
};