/**
 * LifeLink - App Context
 * Global state management using React Context API
 * Manages user auth state (donor/hospital/admin), notifications, and app-wide settings
 */

import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { userAPI } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Auth state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHospital, setIsHospital] = useState(false);
  const [isDonor, setIsDonor] = useState(false);

  // UI state
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('lifelink_token');
    const savedUser = localStorage.getItem('lifelink_user');
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.role === 'admin');
        setIsHospital(userData.role === 'hospital');
        setIsDonor(userData.role === 'donor');
      } catch (e) {
        localStorage.removeItem('lifelink_token');
        localStorage.removeItem('lifelink_user');
      }
    }
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      const result = await userAPI.login({ email, password });
      if (result.success) {
        const userData = result.data;
        localStorage.setItem('lifelink_token', userData.token);
        localStorage.setItem('lifelink_user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.role === 'admin');
        setIsHospital(userData.role === 'hospital');
        setIsDonor(userData.role === 'donor');
        showNotification('Login successful!', 'success');
        return { success: true, role: userData.role };
      }
    } catch (error) {
      showNotification(error.message, 'error');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register
  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      const result = await userAPI.register(userData);
      if (result.success) {
        const data = result.data;
        localStorage.setItem('lifelink_token', data.token);
        localStorage.setItem('lifelink_user', JSON.stringify(data));
        setUser(data);
        setIsAuthenticated(true);
        setIsAdmin(data.role === 'admin');
        setIsHospital(data.role === 'hospital');
        setIsDonor(data.role === 'donor');
        showNotification(result.message, 'success');
        return { success: true, role: data.role };
      }
    } catch (error) {
      showNotification(error.message, 'error');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('lifelink_token');
    localStorage.removeItem('lifelink_user');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsHospital(false);
    setIsDonor(false);
    showNotification('Logged out successfully', 'info');
  }, []);

  // Notification system
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type, id: Date.now() });
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    isHospital,
    isDonor,
    isLoading,
    setIsLoading,
    notification,
    login,
    register,
    logout,
    showNotification
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {/* Global Notification Toast */}
      {notification && (
        <div className={`notification-toast notification-${notification.type}`} key={notification.id}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' && '✓'}
              {notification.type === 'error' && '✕'}
              {notification.type === 'info' && 'ℹ'}
              {notification.type === 'warning' && '⚠'}
            </span>
            <span className="notification-message">{notification.message}</span>
          </div>
          <button className="notification-close" onClick={() => setNotification(null)}>×</button>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
