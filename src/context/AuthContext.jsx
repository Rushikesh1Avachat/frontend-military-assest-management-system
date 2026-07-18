import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { api, setAuthToken } from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mams_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pending credentials to trigger login in an effect
  const [pendingLogin, setPendingLogin] = useState(null); // { email, password }
  const pendingPromiseRef = useRef(null); // { resolve, reject }
  const requestIdRef = useRef(0);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        setAuthToken(token);
        try {
          const response = await api.get('/auth/me');
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
  }, [token]);

  useEffect(() => {
    if (!pendingLogin) return;

    const currentRequestId = ++requestIdRef.current;
    const doLogin = async () => {
      const { email, password } = pendingLogin;

      setError(null);

      try {
        const response = await api.post('/auth/login', { email, password });
        // Only accept results from the latest request
        if (requestIdRef.current !== currentRequestId) return;

        const { token: jwtToken, user: userData } = response.data;

        localStorage.setItem('mams_token', jwtToken);
        setAuthToken(jwtToken);
        setToken(jwtToken);
        setUser(userData);

        pendingPromiseRef.current?.resolve(userData);
      } catch (err) {
        if (requestIdRef.current !== currentRequestId) return;

        const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
        setError(msg);
        pendingPromiseRef.current?.reject(new Error(msg));
      } finally {
        if (requestIdRef.current !== currentRequestId) return;

        // prevent re-using previous promise handlers
        pendingPromiseRef.current = null;
        setPendingLogin(null);
      }
    };

    doLogin();
  }, [pendingLogin]);

const requestLogin = (email, password) => {
  if (pendingLogin) {
    return Promise.reject(new Error('Login already in progress'));
  }
  return new Promise((resolve, reject) => {
    pendingPromiseRef.current = { resolve, reject };
    setPendingLogin({ email, password });
  });
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
