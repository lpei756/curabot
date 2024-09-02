const getFromLocalStorage = (itemName) => localStorage.getItem(itemName);
const saveInLocalStorage = (itemName, value) => localStorage.setItem(itemName, value);
const removeFromLocalStorage = (itemName) => localStorage.removeItem(itemName);

const TOKEN = 'authToken';
const USER_DATA = 'userData';
const ADMINTOKEN = 'adminToken';
const ADMIN_DATA = 'adminData';

const getJSONFromLocalStorage = (itemName) => {
  const item = getFromLocalStorage(itemName);
  return item ? JSON.parse(item) : null;
};
const saveJSONInLocalStorage = (itemName, value) =>
  saveInLocalStorage(itemName, JSON.stringify(value));

export const tokenStorage = {
  get: () => getFromLocalStorage(TOKEN),
  save: (value) => saveInLocalStorage(TOKEN, value),
  remove: () => removeFromLocalStorage(TOKEN)
};

export const adminTokenStorage = {
  get: () => getFromLocalStorage(ADMINTOKEN),
  save: (value) => saveInLocalStorage(ADMINTOKEN, value),
  remove: () => removeFromLocalStorage(ADMINTOKEN)
};

export const userDataStorage = {
  get: () => getJSONFromLocalStorage(USER_DATA),
  save: (value) => saveJSONInLocalStorage(USER_DATA, value),
  remove: () => removeFromLocalStorage(USER_DATA)
};

export const adminDataStorage = {
  get: () => getJSONFromLocalStorage(ADMIN_DATA),
  save: (value) => saveJSONInLocalStorage(ADMIN_DATA, value),
  remove: () => removeFromLocalStorage(ADMIN_DATA)
};
