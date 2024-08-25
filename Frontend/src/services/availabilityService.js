import { API_PATH } from '../utils/urlRoutes';

const apiRequest = async (url, options = {}) => {
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error making API request:', error);
        throw error;
    }
};

export const fetchAvailableSlotsByDate = async (date) => {
    const url = API_PATH.availability.getByDate.replace(':date', date);
    return apiRequest(url);
};

export const fetchAllAvailableSlots = async () => {
    const url = API_PATH.availability.getAll;
    return apiRequest(url);
};

export const fetchGpSlotsByDoctorId = async (doctorId) => {
    const url = API_PATH.availability.getByDoctor.replace(':doctorID', doctorId);
    return apiRequest(url);
};

export const fetchSlotsByAddress = async (address) => {
    const encodedAddress = encodeURIComponent(address);
    const url = API_PATH.availability.getByAddress.replace(':address', encodedAddress);
    return apiRequest(url);
};

export const updateSlotIsBooked = async (slotId, userId) => {
    const url = API_PATH.availability.updateIsBooked
        .replace(':slotId', slotId)
        .replace(':userId', userId);

    return apiRequest(url, { method: 'PUT' });
};
