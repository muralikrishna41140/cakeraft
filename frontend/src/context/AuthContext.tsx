'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Admin {
  id: string;
  email: string;
  lastLogin?: string;
  createdAt?: string;
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastTokenCheck, setLastTokenCheck] = useState<number>(0);

  const isAuthenticated = !!admin && !!token;

  // Check for existing authentication on app start
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 Checking for existing authentication...');
      
      try {
        // Check for stored token
        const storedToken = localStorage.getItem('token');
        const storedAdmin = localStorage.getItem('admin');
        const lastCheck = localStorage.getItem('lastTokenCheck');
        
        if (storedToken && storedAdmin) {
          console.log('📱 Found stored auth data...');
          
          // Set token and admin from storage immediately for faster UI
          setToken(storedToken);
          const adminData = JSON.parse(storedAdmin);
          setAdmin(adminData);
          
          // Only verify token if it's been more than 5 minutes since last check
          const now = Date.now();
          const lastCheckTime = lastCheck ? parseInt(lastCheck) : 0;
          const fiveMinutes = 5 * 60 * 1000;
          
          if (now - lastCheckTime > fiveMinutes) {
            console.log('🔄 Verifying token (last check was more than 5 minutes ago)...');
            
            try {
              // Verify token is still valid
              const response = await authAPI.verifyToken();
              const freshAdminData = response.data.admin;
              
              // Update admin data with fresh info from server
              setAdmin(freshAdminData);
              localStorage.setItem('admin', JSON.stringify(freshAdminData));
              localStorage.setItem('lastTokenCheck', now.toString());
              setLastTokenCheck(now);
              
              console.log('✅ Token verified and authentication restored for:', freshAdminData.email);
            } catch (error) {
              console.error('❌ Token verification failed, clearing auth:', error);
              // Clear invalid auth data
              localStorage.removeItem('token');
              localStorage.removeItem('admin');
              localStorage.removeItem('lastTokenCheck');
              setToken(null);
              setAdmin(null);
            }
          } else {
            console.log('✅ Using cached authentication (verified recently)');
            setLastTokenCheck(lastCheckTime);
          }
        } else {
          console.log('❌ No valid authentication found');
          // Clear any invalid/partial data
          localStorage.removeItem('token');
          localStorage.removeItem('admin');
          localStorage.removeItem('lastTokenCheck');
        }
      } catch (error) {
        console.error('🔄 Auth initialization failed:', error);
        // Clear invalid auth data
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        localStorage.removeItem('lastTokenCheck');
        setToken(null);
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.login(email, password);
      const { token: newToken, admin: adminData } = response.data;
      
      const now = Date.now();
      
      // Store in localStorage for persistence across sessions
      localStorage.setItem('token', newToken);
      localStorage.setItem('admin', JSON.stringify(adminData));
      localStorage.setItem('lastTokenCheck', now.toString());
      
      // Update state
      setToken(newToken);
      setAdmin(adminData);
      setLastTokenCheck(now);
      
      console.log('✅ Login successful and persisted:', adminData.email);
      toast.success(`Welcome back, ${adminData.name || adminData.email}!`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      console.error('❌ Login error:', message);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    localStorage.removeItem('lastTokenCheck');
    
    // Clear state
    setToken(null);
    setAdmin(null);
    setLastTokenCheck(0);
    
    toast.success('Logged out successfully');
    
    // Redirect to login
    window.location.href = '/login';
  };

  const checkAuth = async (): Promise<void> => {
    try {
      if (!token) {
        throw new Error('No token available');
      }
      
      const now = Date.now();
      
      // Only check if it's been more than 5 minutes since last check
      if (now - lastTokenCheck < 5 * 60 * 1000) {
        console.log('✅ Using cached token verification');
        return;
      }
      
      const response = await authAPI.verifyToken();
      const adminData = response.data.admin;
      
      // Update admin data and cache timestamp
      setAdmin(adminData);
      setLastTokenCheck(now);
      localStorage.setItem('admin', JSON.stringify(adminData));
      localStorage.setItem('lastTokenCheck', now.toString());
      
      console.log('✅ Token verified and cached');
    } catch (error) {
      console.error('Token verification failed:', error);
      // Clear invalid auth data
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      localStorage.removeItem('lastTokenCheck');
      setToken(null);
      setAdmin(null);
      setLastTokenCheck(0);
    }
  };

  const value: AuthContextType = {
    admin,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};