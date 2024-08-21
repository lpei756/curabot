import { API_PATH } from '../utils/urlRoutes';

export const fetchAvailableSlotsByDate = async (date) => {
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(API_PATH.availability.getByDate.replace(':date', date), {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching slots:', error);
        throw error;
    }
};

export const fetchAllAvailableSlots = async () => {
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(API_PATH.availability.getAll, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching all slots:', error);
        throw error;
    }
};

export const fetchGpSlotsByDoctorId = async (doctorId) => {
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(API_PATH.availability.getByDoctor.replace(':doctorID', doctorId), {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching GP slots:', error);
        throw error;
    }
};

export const fetchSlotsByAddress = async (address) => {
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(API_PATH.availability.getByAddress.replace(':address', encodeURIComponent(address)), {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching slots by address:', error);
        throw error;
    }
};
