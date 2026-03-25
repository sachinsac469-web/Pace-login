import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      try {
        // Decode simple JWT to get role and name without an API call if possible, 
        // or just store it in localStorage. For simplicity, we just store it in localStorage.
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) setUser(storedUser);
      } catch (e) {
        setToken(null);
        localStorage.removeItem('token');
      }
    }
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('device_token', userData.device_token);
    setToken(newToken);
    setUser(userData);
  };

  const logout = (message = '') => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('device_token');
    setToken(null);
    setUser(null);
    if (message) alert(message);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
