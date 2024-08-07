// Define the names of the items stored in the localStorage
const getFromLocalStorage = (itemName) => localStorage.getItem(itemName);
const saveInLocalStorage = (itemName, value) => localStorage.setItem(itemName, value);
const removeFromLocalStorage = (itemName) => localStorage.removeItem(itemName);

const TOKEN = 'authToken';
const USER_DATA = 'userData';

// Functions to handle complex data types like objects
const getJSONFromLocalStorage = (itemName) => {
  const item = getFromLocalStorage(itemName);
  return item ? JSON.parse(item) : null;
};
const saveJSONInLocalStorage = (itemName, value) =>
  saveInLocalStorage(itemName, JSON.stringify(value));

// Unified approach for handling localStorage operations
export const tokenStorage = {
  get: () => getFromLocalStorage(TOKEN),
  save: (value) => saveInLocalStorage(TOKEN, value),
  remove: () => removeFromLocalStorage(TOKEN)
};

// Unified approach for handling localStorage operations
export const userDataStorage = {
  get: () => getJSONFromLocalStorage(USER_DATA),
  save: (value) => saveJSONInLocalStorage(USER_DATA, value),
  remove: () => removeFromLocalStorage(USER_DATA)
};
