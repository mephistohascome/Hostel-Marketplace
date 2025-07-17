import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Set base URL for axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Set auth token in axios headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Load user from token on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        setAuthToken(token);
        try {
          const response = await axios.get('/api/auth/me');
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await axios.post('/api/auth/register', userData);
      
      if (response.data.success) {
        const { token, user } = response.data;
        setAuthToken(token);
        setUser(user);
        return { success: true, message: response.data.message };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, user } = response.data;
        setAuthToken(token);
        setUser(user);
        return { success: true, message: response.data.message };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setError('');
  };

  // Update user function
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // Clear error function
  const clearError = () => {
    setError('');
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};