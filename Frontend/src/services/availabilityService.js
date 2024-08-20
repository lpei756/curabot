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

    const data = await response.json();
    return data;
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
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching all slots:', error);
      throw error;
    }
  };