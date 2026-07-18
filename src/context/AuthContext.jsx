import React, { createContext, useState, useEffect, useContext } from 'react';
import { api, setAuthToken } from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mams_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        setAuthToken(token);
        try {
          const response = await api.get('auth/me');
          setUser(response.data);
        } catch (err) {
          console.error('Session expired or invalid token:', err.message);
          logout();
        }
      } else {
        setAuthToken(null);
      }
      setLoading(false);
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestLogin = async (email, password) => {
    setError(null);
    try {
      const response = await api.post('auth/login', { email, password });
      const { token: jwtToken, user: userData } = response.data;

      localStorage.setItem('mams_token', jwtToken);
      setAuthToken(jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('mams_token');
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login: requestLogin, // keep external API name stable
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
