import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AppointmentModel from '../src/models/Appointment.js';
import crypto from 'crypto';

dotenv.config({ path: './Backend/.env' });

console.log('MONGO_URI:', process.env.MONGO_URI);

const appointments = [
    {
        patientID: "292379",
        patientName: "Bess Yang",
        dateTime: new Date("2024-09-16T04:29:00.000Z"),
        assignedGP: "D001",
        clinic: new mongoose.Types.ObjectId("66ac6360d1864aef73c64a69"),
        slotId: new mongoose.Types.ObjectId("66ce4b9e209366f4a8cd7a55"),
        status: "Scheduled"
    },
    {
        patientID: "292379",
        patientName: "Bess Yang",
        dateTime: new Date("2024-09-16T04:58:00.000Z"),
        assignedGP: "D001",
        clinic: new mongoose.Types.ObjectId("66ac6360d1864aef73c64a69"),
        slotId: new mongoose.Types.ObjectId("66ce4b9e209366f4a8cd7a55"),
        status: "Scheduled"
    }
];

appointments.forEach(appointment => {
    appointment.appointmentID = crypto.randomInt(100000, 1000000).toString();
});

async function insertAppointments() {
    try {
        const result = await AppointmentModel.insertMany(appointments);
        console.log('Appointments inserted:', result);
    } catch (error) {
        console.error('Error inserting appointments:', error);
    }
}

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
        insertAppointments();
    })
    .catch((err) => console.error('MongoDB connection error:', err));
