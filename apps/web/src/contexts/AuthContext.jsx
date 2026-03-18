import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '../lib/pocketbaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already authenticated on mount
    if (pb.authStore.isValid && pb.authStore.model?.collectionName === 'admin_users') {
      setCurrentAdmin(pb.authStore.model);
      setIsAuthenticated(true);
    }
    setInitialLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('admin_users').authWithPassword(email, password);
      setCurrentAdmin(authData.record);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentAdmin(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentAdmin,
    isAuthenticated,
    initialLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
