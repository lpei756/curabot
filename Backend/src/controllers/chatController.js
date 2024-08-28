import leven from 'leven';
import { getAppointmentsForUser, processChatWithOpenAI } from '../services/chatService.js';
import { extractUserIdFromToken } from '../middlewares/authMiddleware.js';
import { getAllAvailableSlots, findNearestSlot } from '../services/doctorAvailabilityService.js';
import { getDoctorByIdService } from '../services/doctorService.js';
import { readUser } from '../services/authService.js';
import * as cheerio from 'cheerio';

export const handleChat = async (req, res) => {
  try {
    const userMessage = req.body.message.toLowerCase();
    const authToken = req.headers.authorization;
    const userLocation = req.body.userLocation;

    const appointmentRequestKeywords = [
      'show my appointments',
      'list my appointments',
      'my appointments',
      'appointments',
    ];

    const autoAppointmentKeywords = [
      'schedule appointment',
      'book appointment',
      'find available slot',
      'auto appointment',
      'booking'
    ];

    const cancelAppointmentKeywords = [
      'cancel appointment',
      'remove appointment',
      'delete appointment',
      'cancel my appointment',
      'cancel'
    ];

    const threshold = 5;

    const matchesKeyword = (message, keywords) => {
      return keywords.some(keyword => leven(message, keyword) <= threshold);
    };

    if (matchesKeyword(userMessage, appointmentRequestKeywords)) {
      if (!authToken) {
        return res.status(401).json({ error: 'Unauthorized: No token provided. Please log in to view your appointments.' });
      }

      try {
        const userId = extractUserIdFromToken(authToken);
        if (!userId) {
          return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        const appointmentsReply = await getAppointmentsForUser(userId, authToken);
        return res.json({ reply: appointmentsReply });
      } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
    }

    if (matchesKeyword(userMessage, autoAppointmentKeywords)) {
      if (!authToken) {
        return res.status(401).json({ error: 'Unauthorized: No token provided. Please log in to schedule an appointment.' });
      }

      if (!userLocation) {
        return res.status(400).json({ error: 'Bad Request: User location is required to find available slots.' });
      }

      try {
        const availableSlots = await getAllAvailableSlots();
        if (!availableSlots || availableSlots.length === 0) {
          return res.json({
            reply: 'Sorry, there are no available slots at the moment. Please try again later.'
          });
        }

        const userId = extractUserIdFromToken(authToken);
        if (!userId) {
          return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        const user = await readUser(userId);

        const nearestSlot = await findNearestSlot(availableSlots, userLocation, user);
        if (!nearestSlot) {
          return res.json({
            reply: 'Sorry, there are no available slots matching your preferences at the moment. Please try again later.'
          });
        }

        const doctorResult = await getDoctorByIdService(nearestSlot.doctorID);
        if (doctorResult.error) {
          return res.status(doctorResult.status).json({ message: doctorResult.message });
        }

        const clinicId = doctorResult.doctor.clinic;
        const distance = nearestSlot.tempDistance || 'N/A';

        return res.json({
          reply: `
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
              `
        });
      } catch (error) {
        console.error('Error fetching or processing available slots:', error);
        return res.status(500).json({ error: 'Error fetching available slots' });
      }
    }

    if (matchesKeyword(userMessage, cancelAppointmentKeywords)) {
      if (!authToken) {
        return res.status(401).json({ error: 'Unauthorized: No token provided. Please log in to view or cancel your appointments.' });
      }

      const userId = extractUserIdFromToken(authToken);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
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
          return res.json({ reply: 'You have no scheduled appointments to cancel.' });
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

        return res.json({ reply });
      } catch (error) {
        console.error('Error fetching or processing appointments:', error);
        return res.status(500).json({ error: 'Error fetching appointments' });
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
