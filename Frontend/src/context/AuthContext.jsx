import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { tokenStorage } from '../utils/localStorage.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = tokenStorage.get();
    if (token) {
      setAuthToken(token);
      const fetchedUserId = parseUserIdFromToken(token);
      setUserId(fetchedUserId);
    }
  }, []);

  const login = (token) => {
    tokenStorage.save(token);
    setAuthToken(token);
    const fetchedUserId = parseUserIdFromToken(token);
    setUserId(fetchedUserId);
  };

  const logout = () => {
    tokenStorage.remove();
    setAuthToken('');
    setUserId(null);
  };

  return (
      <AuthContext.Provider value={{ authToken, userId, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

function parseUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload?.user?._id;
    if (userId) {
      return userId;
    } else {
      console.error('User ID not found in token payload');
      return null;
    }
  } catch (e) {
    console.error('Failed to parse userId from token:', e);
    return null;
  }
}
