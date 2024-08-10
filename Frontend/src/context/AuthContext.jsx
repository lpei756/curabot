import { createContext, useState, useEffect } from 'react';
import { tokenStorage } from '../utils/localStorage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    const token = tokenStorage.get();
    if (token) {
      setAuthToken(token);
    }
  }, []);

  const login = (token) => {
    tokenStorage.save(token);
    setAuthToken(token);
  };

  const logout = () => {
    tokenStorage.remove();
    setAuthToken('');
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
