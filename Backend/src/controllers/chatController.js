import { getAppointmentsForUser, processChatWithOpenAI } from '../services/chatService.js';
import { extractUserIdFromToken } from '../middlewares/authMiddleware.js';
import { getAllAvailableSlots, findNearestSlot } from '../services/doctorAvailabilityService.js';
import { getDoctorByIdService } from '../services/doctorService.js';
import { readUser } from '../services/authService.js';

export const handleChat = async (req, res) => {
  try {
    const userMessage = req.body.message;
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

    if (appointmentRequestKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
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

    if (autoAppointmentKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
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
          const distance = nearestSlot.tempDistance || 'N/A'; // Default to 'N/A' if distance is not provided
  
          return res.json({
              reply: `
                  I found an available slot for you. Would you like to book it?
                  <p><strong>Date:</strong> ${new Date(nearestSlot.startTime).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> ${new Date(nearestSlot.startTime).toLocaleTimeString()}</p>
                  <p><strong>Distance:</strong> ${distance} km</p>
                  <button onclick="
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
