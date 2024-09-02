import DoctorAvailability from '../models/DoctorAvailability.js';
import Clinic from '../models/Clinic.js';
import moment from 'moment';
import { getDoctorByIdService } from './doctorService.js';
import { getClinicByIdService } from './clinicService.js';
import axios from 'axios';

export const setAvailability = async (doctorID, date, startTime, endTime, isBooked, bookedBy) => {
    const utcDate = moment(date, 'YYYY-MM-DD').utc().startOf('day').toDate();
    const utcStartTime = moment(startTime, 'YYYY-MM-DD h:mm A').utc().toDate();
    const utcEndTime = moment(endTime, 'YYYY-MM-DD h:mm A').utc().toDate();

    const availability = new DoctorAvailability({
        doctorID,
        date: utcDate,
        startTime: utcStartTime,
        endTime: utcEndTime,
        isBooked,
        bookedBy
    });

    return await availability.save();
};

export const getAvailabilityByDoctorID = async (doctorID) => {
    return await DoctorAvailability.find({ doctorID });
};

export const getAllAvailabilityByDate = async (date) => {
    return await DoctorAvailability.find({ date });
};

export const getAvailabilityByAddress = async (partialAddress) => {
    try {
        console.log('Searching for clinics with partial address:', partialAddress);
        const clinic = await Clinic.findOne({
            address: { $regex: partialAddress, $options: 'i' }
        }).exec();

        if (!clinic) {
            console.error('Clinic not found for partial address:', partialAddress);
            throw new Error('Clinic not found');
        }

        console.log('Clinic found:', clinic);
        const doctorIDs = clinic.doctors.map(doctor => doctor.doctorID);

        console.log('Doctor IDs from clinic:', doctorIDs);
        const availability = await DoctorAvailability.find({ doctorID: { $in: doctorIDs } }).exec();

        console.log('Availability found:', availability);
        return availability;
    } catch (error) {
        console.error('Error fetching availability by address:', error);
        throw error;
    }
};

export const getAllAvailableSlots = async () => {
    try {
        return await DoctorAvailability.find({ isBooked: false }).exec();
    } catch (error) {
        console.error('Error fetching all available slots:', error);
        throw new Error('Failed to fetch available slots');
    }
};

export const updateAvailability = async (doctorID, slotId, updates) => {
    try {
        const doctorAvailability = await DoctorAvailability.findOne({
            doctorID,
            _id: slotId
        });

        if (!doctorAvailability) {
            throw new Error('Doctor availability not found');
        }

        const startTime = new Date(updates.startTime);
        const endTime = new Date(updates.endTime);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            throw new Error('Invalid date format');
        }

        doctorAvailability.startTime = startTime;
        doctorAvailability.endTime = endTime;
        doctorAvailability.isBooked = updates.isBooked;
        doctorAvailability.bookedBy = updates.bookedBy;

        await doctorAvailability.save();
        return doctorAvailability;
    } catch (error) {
        console.error('Error updating slot:', error);
        throw error;
    }
};

export const deleteAvailability = async (doctorID, slotId) => {
    try {
        const result = await DoctorAvailability.deleteOne({
            doctorID,
            _id: slotId
        });

        if (result.deletedCount === 0) {
            throw new Error('Doctor availability not found');
        }

        return { message: 'Slot deleted successfully' };
    } catch (error) {
        console.error('Error deleting slot:', error);
        throw error;
    }
};

export const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 1000) / 1000;
};

export const geocodeAddress = async (address) => {
    if (!address) {
        throw new Error('Address is required for geocoding');
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        throw new Error('API key is missing');
    }

    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                key: apiKey
            }
        });
        const location = response.data.results[0]?.geometry?.location;
        if (location) {
            return {
                lat: location.lat,
                lng: location.lng
            };
        } else {
            throw new Error('Geocoding failed for address: ' + address);
        }
    } catch (error) {
        console.error('Error during geocoding request:', error);
        throw new Error('Geocoding request failed');
    }
};

export const findNearestSlot = async (slots, userLocation, user) => {
    const now = new Date();
    let bestSlot = null;
    let bestScore = Infinity;

    if (!user) {
        console.error("User object is missing.");
        return null;
    }

    const hasGp = user.gp && user.gp.trim().length > 0;

    for (const slot of slots) {
        const slotDateTime = new Date(slot.date);
        const startTime = new Date(slot.startTime);
        slotDateTime.setHours(startTime.getUTCHours(), startTime.getUTCMinutes());

        if (slotDateTime < now) {
            continue;
        }

        const timeDiff = slotDateTime - now;

        const doctorResult = await getDoctorByIdService(slot.doctorID);
        if (doctorResult.error) {
            console.error(`Error fetching doctor data for slot ${slot._id}:`, doctorResult.error);
            continue;
        }

        const doctor = doctorResult.doctor;
        if (!doctor || !doctor.clinic) {
            console.error(`Doctor or clinic information is missing for slot ${slot._id}`);
            continue;
        }

        const clinicResult = await getClinicByIdService(doctor.clinic);
        if (clinicResult.error) {
            console.error(`Error fetching clinic data for doctor ${doctor._id}:`, clinicResult.error);
            continue;
        }

        const clinic = clinicResult.clinic;
        const address = clinic.address;
        if (!address) {
            console.error(`Clinic address is missing for doctor ${doctor._id}`);
            continue;
        }

        try {
            const clinicLocation = await geocodeAddress(address);
            if (!clinicLocation) {
                console.error(`Unable to geocode address ${address}`);
                continue;
            }

            const distance = haversineDistance(userLocation.lat, userLocation.lng, clinicLocation.lat, clinicLocation.lng);
            const timeScore = timeDiff / (1000 * 60 * 60);
            const distanceScore = distance;

            const gpScore = hasGp && user.gp === slot.doctorID ? -10 : 0;

            const combinedScore = timeScore + distanceScore + gpScore;
            console.log(`Combined Score for slot ${slot._id}: ${combinedScore}`);

            if (combinedScore < bestScore) {
                bestScore = combinedScore;
                bestSlot = slot;
                bestSlot.tempDistance = distance;
            }
        } catch (error) {
            console.error(`Error processing slot ${slot._id}:`, error);
        }
    }

    console.log('Best Slot with Distance and GP Preference:', bestSlot);
    return bestSlot;
};
