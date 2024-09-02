import leven from 'leven';
import { getAppointmentsForUser, processChatWithOpenAI, getHistoryBySessionId, identifySpecialisation, detectSymptomsUsingNLP } from '../services/chatService.js';
import { extractUserIdFromToken } from '../middlewares/authMiddleware.js';
import { getAllAvailableSlots, findNearestSlot } from '../services/doctorAvailabilityService.js';
import { getDoctorByIdService } from '../services/doctorService.js';
import { readUser } from '../services/authService.js';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import ChatSession from '../models/ChatSession.js';

const sessionStore = {};

const isSessionExpired = (lastActivityTime) => {
  const currentTime = new Date();
  return (currentTime - new Date(lastActivityTime)) > 15 * 60 * 1000;
};

const updateSession = (sessionId) => {
  const currentTime = new Date();
  sessionStore[sessionId] = currentTime;
};

export const handleChat = async (req, res) => {
  try {
    const userMessage = req.body.message.toLowerCase();
    const authToken = req.headers.authorization;
    const userLocation = req.body.userLocation;
    let sessionId = req.body.sessionId || uuidv4();
    let userId = null;
    let isAnonymous = true;

    if (authToken) {
      try {
        userId = extractUserIdFromToken(authToken);
        isAnonymous = false;
      } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token', sessionId });
      }
    }

    if (sessionId && sessionStore[sessionId] && !isSessionExpired(sessionStore[sessionId])) {
      console.log(`Session ${sessionId} is still active.`);
      updateSession(sessionId);
    } else {
      sessionId = uuidv4();
      console.log(`Created new session: ${sessionId}`);
      updateSession(sessionId);
      await ChatSession.create({ _id: sessionId, userId, messages: [] });
    }

    await ChatSession.findByIdAndUpdate(
      sessionId,
      { $push: { messages: { sender: 'user', message: userMessage, isAnonymous } } }
    );

    const appointmentRequestKeywords = [
      'show my appointments',
      'list my appointments',
      'my appointments',
      'appointments',
      'appointment'
    ];

    const autoAppointmentKeywords = [
      'schedule appointment',
      'book appointment',
      'find available slot',
      'auto appointment',
      'booking',
      'book',
      'schedule'
    ];

    const cancelAppointmentKeywords = [
      'cancel appointment',
      'remove appointment',
      'delete appointment',
      'cancel my appointment',
      'cancel',
      'remove',
      'delete'
    ];

    const threshold = 2;

    const matchesKeyword = (message, keywords) => {
      return keywords.some(keyword => leven(message, keyword) <= threshold);
    };

    if (userMessage === 'crazy thursday') {
      const moneyEmojis = '💰'.repeat(50);
      await ChatSession.findByIdAndUpdate(
        sessionId,
        { $push: { messages: { sender: 'bot', message: moneyEmojis, isAnonymous } } }
      );
      return res.json({ reply: moneyEmojis, sessionId });
    }

    if (matchesKeyword(userMessage, appointmentRequestKeywords)) {
      if (!authToken) {
        return res.status(401).json({ error: 'Unauthorized: No token provided. Please log in to view your appointments.', sessionId });
      }

      try {
        const userId = extractUserIdFromToken(authToken);
        if (!userId) {
          return res.status(401).json({ error: 'Unauthorized: Invalid token', sessionId });
        }

        const appointmentsReply = await getAppointmentsForUser(userId, authToken);
        await ChatSession.findByIdAndUpdate(
          sessionId,
          { $push: { messages: { sender: 'bot', message: appointmentsReply, isAnonymous } } }
        );
        return res.json({ reply: appointmentsReply, sessionId });
      } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token', sessionId });
      }
    }

    if (matchesKeyword(userMessage, autoAppointmentKeywords)) {
      if (!authToken) {
        return res.status(401).json({ error: 'Unauthorized: No token provided. Please log in to schedule an appointment.', sessionId });
      }

      if (!userLocation) {
        return res.status(400).json({ error: 'Bad Request: User location is required to find available slots.', sessionId });
      }

      try {
        const availableSlots = await getAllAvailableSlots();
        if (!availableSlots || availableSlots.length === 0) {
          const noSlotsReply = 'Sorry, there are no available slots at the moment. Please try again later.';
          await ChatSession.findByIdAndUpdate(
            sessionId,
            { $push: { messages: { sender: 'bot', message: noSlotsReply, isAnonymous } } }
          );
          return res.json({ reply: noSlotsReply, sessionId });
        }

        const userId = extractUserIdFromToken(authToken);
        if (!userId) {
          return res.status(401).json({ error: 'Unauthorized: Invalid token', sessionId });
        }

        const user = await readUser(userId);
        const nearestSlot = await findNearestSlot(availableSlots, userLocation, user);
        if (!nearestSlot) {
          const noMatchReply = 'Sorry, there are no available slots matching your preferences at the moment. Please try again later.';
          await ChatSession.findByIdAndUpdate(
            sessionId,
            { $push: { messages: { sender: 'bot', message: noMatchReply, isAnonymous } } }
          );
          return res.json({ reply: noMatchReply, sessionId });
        }

        const doctorResult = await getDoctorByIdService(nearestSlot.doctorID);
        if (doctorResult.error) {
          return res.status(doctorResult.status).json({ message: doctorResult.message, sessionId });
        }

        const clinicId = doctorResult.doctor.clinic;
        const distance = nearestSlot.tempDistance || 'N/A';

        const botResponse = `
                  I found an available slot for you. Would you like to book it?
                  <p><strong>Date:</strong> ${new Date(nearestSlot.startTime).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> ${new Date(nearestSlot.startTime).toLocaleTimeString()}</p>
                  <p><strong>Distance:</strong> ${distance} km</p>
                  <button style="background-color: #03035d; color: #f8f6f6; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;" onclick="
                      (async function() {
                          try {
                              const response = await fetch('http://localhost:3001/api/appointments/create', {
                                  method: 'POST',
                                  headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': '${authToken}'
                                  },
                                  body: JSON.stringify({
                                      dateTime: '${nearestSlot.startTime.toISOString()}',
                                      clinic: '${clinicId}',
                                      assignedGP: '${nearestSlot.doctorID}',
                                      slotId: '${nearestSlot._id}'
                                  })
                              });
                              const data = await response.json();
                              if (response.ok) {
                                  alert('Your appointment has been successfully booked.');
                              } else {
                                  alert('Error: ' + data.message);
                              }
                          } catch (error) {
                              alert('Sorry, something went wrong. Please try again.');
                          }
                      })()
                  ">Book Now</button>
                  <p>If you are not satisfied with this slot, you can <a href="http://localhost:5173/appointment/new">choose a different slot here</a>.</p>
              `;
        await ChatSession.findByIdAndUpdate(
          sessionId,
          { $push: { messages: { sender: 'bot', message: botResponse, isAnonymous } } }
        );

        return res.json({ reply: botResponse, sessionId });
      } catch (error) {
        console.error('Error fetching or processing available slots:', error);
        return res.status(500).json({ error: 'Error fetching available slots', sessionId });
      }
    }

    if (matchesKeyword(userMessage, cancelAppointmentKeywords)) {
      if (!authToken) {
        return res.status(401).json({ error: 'Unauthorized: No token provided. Please log in to view or cancel your appointments.', sessionId });
      }

      const userId = extractUserIdFromToken(authToken);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token', sessionId });
      }

      try {
        const appointmentsData = await getAppointmentsForUser(userId, authToken);

        console.log('Raw Appointments Data:', appointmentsData);

        const $ = cheerio.load(appointmentsData);
        const appointments = [];

        $('div div').each((index, element) => {
          const id = $(element).find('p').eq(0).text().split(':')[1].trim();
          const date = $(element).find('p').eq(1).text().split(':')[1].trim();
          const status = $(element).find('p').eq(2).text().split(':')[1].trim();

          if (status === 'Scheduled' && !appointments.find(a => a.appointmentID === id)) {
            appointments.push({ appointmentID: id, startTime: date, status });
          }
        });

        if (!appointments || appointments.length === 0) {
          const noAppointmentsReply = 'You have no scheduled appointments to cancel.';
          await ChatSession.findByIdAndUpdate(
            sessionId,
            { $push: { messages: { sender: 'bot', message: noAppointmentsReply, isAnonymous } } }
          );
          return res.json({ reply: noAppointmentsReply, sessionId });
        }

        let reply = 'Here are your scheduled appointments. Click "Cancel" to cancel any appointment:\n';
        appointments.forEach(appointment => {
          reply += `
                  <p><strong>Date:</strong> ${new Date(appointment.startTime).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> ${new Date(appointment.startTime).toLocaleTimeString()}</p>
                  <button style="background-color: #03035d; color: #f8f6f6; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;" onclick="
                  (async function() {
                      try {
                          const response = await fetch('http://localhost:3001/api/appointments/${appointment.appointmentID}', {
                          method: 'DELETE', 
                          headers: {
                              'Content-Type': 'application/json',
                              'Authorization': '${authToken}'
                          }
                      });
                      const data = await response.json();
                      if (response.ok) {
                          alert('Your appointment has been successfully cancelled.');
                      } else {
                          alert('Error: ' + data.message);
                      }
                  } catch (error) {
                      alert('Sorry, something went wrong. Please try again.');
                  }
                  })()
                  ">Cancel</button>
              `;
        });
        await ChatSession.findByIdAndUpdate(
          sessionId,
          { $push: { messages: { sender: 'bot', message: reply, isAnonymous } } }
        );
        return res.json({ reply, sessionId });
      } catch (error) {
        console.error('Error fetching or processing appointments:', error);
        return res.status(500).json({ error: 'Error fetching appointments', sessionId });
      }
    }

    const detectedSymptoms = await detectSymptomsUsingNLP(userMessage);
    const symptoms = Array.isArray(detectedSymptoms) ? detectedSymptoms : [detectedSymptoms];

    if (symptoms.length > 0 && symptoms[0] !== 'No symptoms detected.') {
      try {
        const { specialisation, doctors } = await identifySpecialisation(symptoms.join(', '), userLocation);
        console.log('Specialisation:', specialisation);

        if (Array.isArray(doctors) && doctors.length > 0) {
          const doctorDetails = doctors.map(doctor =>
            `<p><strong>Name:</strong> ${doctor.doctorName}, <strong>Clinic:</strong> ${doctor.clinicName}, <strong>Distance:</strong> ${doctor.distance.toFixed(2)} km</p>`
          ).join('');

          const responseMessage = `
            Based on the symptoms you’ve described, it seems like you might need to consult with a doctor in the field of <strong>${specialisation}</strong>. Here are some doctors who could assist you:
            ${doctorDetails}
          `;

          await ChatSession.findByIdAndUpdate(
            sessionId,
            { $push: { messages: { sender: 'bot', message: responseMessage, isAnonymous } } }
          );
          return res.json({ reply: responseMessage, sessionId });
        } else {
          const noSpecialisationReply = 'I’m sorry, but I couldn’t find any relevant specialisations based on the symptoms you mentioned. It might be helpful to provide more details or consult a healthcare professional directly. If you need any further assistance, feel free to let me know.';
          console.log('No specialisation found');
          await ChatSession.findByIdAndUpdate(
            sessionId,
            { $push: { messages: { sender: 'bot', message: noSpecialisationReply, isAnonymous } } }
          );
          return res.json({ reply: noSpecialisationReply, sessionId });
        }
      } catch (error) {
        console.error('Error handling specialisation:', error);
        return res.status(500).json({ error: 'Internal server error', sessionId });
      }
    } else {
      try {
        const generalResponse = await processChatWithOpenAI(userMessage);
        await ChatSession.findByIdAndUpdate(
          sessionId,
          { $push: { messages: { sender: 'bot', message: generalResponse, isAnonymous } } }
        );
        return res.json({ reply: generalResponse, sessionId });
      } catch (error) {
        console.error('Error processing chat with OpenAI:', error);
        return res.status(500).json({ error: 'Internal server error', sessionId });
      }
    }
  } catch (error) {
    console.error('Error handling chat:', error);
    return res.status(500).json({ error: 'Internal server error', sessionId });
  }
};

export const fetchUserChatHistories = async (req, res) => {
  const { userId } = req.params;
  try {
    const chatSessions = await ChatSession.find({ userId });

    if (!chatSessions || chatSessions.length === 0) {
      return res.status(404).json({ error: 'No chat history found for this user.' });
    }
    return res.json({ chatSessions });
  } catch (error) {
    console.error('Error fetching user chat histories:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const fetchChatHistoryBySessionId = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const chatSession = await getHistoryBySessionId(sessionId);

    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json(chatSession);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
