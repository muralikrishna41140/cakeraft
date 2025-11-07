'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { retryRequest, getErrorMessage, isNetworkError } from '@/lib/apiRetry';
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
          
          // Only verify token if it's been more than 30 minutes since last check
          // This reduces unnecessary verification requests and prevents timeout issues
          const now = Date.now();
          const lastCheckTime = lastCheck ? parseInt(lastCheck) : 0;
          const thirtyMinutes = 30 * 60 * 1000; // Increased from 5 to 30 minutes
          
          if (now - lastCheckTime > thirtyMinutes) {
            console.log('🔄 Verifying token (last check was more than 30 minutes ago)...');
            
            // Set a timeout for verification to prevent hanging
            const verificationTimeout = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Verification timeout')), 10000) // 10 second timeout
            );
            
            try {
              // Race between verification and timeout
              const response = await Promise.race([
                authAPI.verifyToken(),
                verificationTimeout
              ]) as any;
              
              const freshAdminData = response.data.admin;
              
              // Update admin data with fresh info from server
              setAdmin(freshAdminData);
              localStorage.setItem('admin', JSON.stringify(freshAdminData));
              localStorage.setItem('lastTokenCheck', now.toString());
              setLastTokenCheck(now);
              
              console.log('✅ Token verified and authentication restored for:', freshAdminData.email);
            } catch (error: any) {
              // If verification fails due to timeout or network, keep cached auth but log warning
              if (error.message === 'Verification timeout' || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
                console.warn('⚠️ Token verification timed out or network issue - using cached auth');
                // Keep the cached auth, just update the last check time to retry later
                localStorage.setItem('lastTokenCheck', (now - (25 * 60 * 1000)).toString()); // Set to 25 min ago so it retries in 5 min
                setLastTokenCheck(now - (25 * 60 * 1000));
              } else {
                // Only clear auth for actual auth failures (401, invalid token, etc.)
                console.error('❌ Token verification failed, clearing auth:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('admin');
                localStorage.removeItem('lastTokenCheck');
                setToken(null);
                setAdmin(null);
              }
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
      
      console.log('🔄 Attempting login...');
      
      // Use retry mechanism for login to handle network issues and cold starts
      const response = await retryRequest(
        () => authAPI.login(email, password),
        {
          maxRetries: 1, // Only retry once for login
          retryDelay: 2000, // Wait 2 seconds before retry
          retryCondition: (error) => {
            // Only retry on pure network errors or timeouts
            // Don't retry on 401 (invalid credentials) or any other HTTP error
            const shouldRetry = (
              error.code === 'ECONNABORTED' || 
              error.code === 'ERR_NETWORK'
            ) && !error.response;
            
            console.log('🔍 Should retry login?', {
              shouldRetry,
              code: error.code,
              hasResponse: !!error.response,
              status: error.response?.status
            });
            
            return shouldRetry;
          }
        }
      );
      
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      
      const { token: newToken, admin: adminData } = response.data;
      
      if (!newToken || !adminData) {
        throw new Error('Invalid login response - missing token or admin data');
      }
      
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
      console.error('❌ Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code
      });
      
      const errorMessage = getErrorMessage(error);
      
      console.error('❌ Login error:', errorMessage);
      toast.error(errorMessage);
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