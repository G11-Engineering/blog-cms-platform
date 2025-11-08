'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { useAuthContext as useAsgardeoAuth } from '@asgardeo/auth-react';
import { authApi } from '@/services/authApi';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  asgardeoSignIn: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isAuthor: boolean;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Intercept Asgardeo authentication state
  const { state: asgardeoState, signIn: asgardeoSignIn, signOut: asgardeoSignOut, getIDToken } = useAsgardeoAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingAuth, setProcessingAuth] = useState(false);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      // Only access localStorage in browser environment
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // First set user from localStorage immediately for faster UI update
          setUser(JSON.parse(storedUser));
          setLoading(false);

          // Then verify token and get fresh data from backend
          const userData = await authApi.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
          setUser(null);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Automatically handle Asgardeo authentication completion
  useEffect(() => {
    const handleAsgardeoAuth = async () => {
      // Only process if:
      // 1. Asgardeo says we're authenticated
      // 2. We don't have a local user yet
      // 3. We're not already processing
      if (asgardeoState.isAuthenticated && !user && !processingAuth) {
        setProcessingAuth(true);
        console.log('✅ Asgardeo authentication detected, exchanging tokens...');

        try {
          // Get ID token from Asgardeo
          const idToken = await getIDToken();

          if (idToken) {
            console.log('✅ Received Asgardeo ID token, exchanging with backend...');

            // Exchange Asgardeo token for our local JWT
            const response = await authApi.asgardeoLogin(idToken);

            // Store the local JWT token and user
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', response.token);
              localStorage.setItem('user', JSON.stringify(response.user));
            }

            setUser(response.user);

            notifications.show({
              title: 'Success',
              message: 'Signed in successfully with Asgardeo',
              color: 'green',
            });
          }
        } catch (error: any) {
          console.error('❌ Authentication error:', error);
          notifications.show({
            title: 'Authentication Error',
            message: error.response?.data?.error?.message || 'Failed to complete authentication',
            color: 'red',
          });
        } finally {
          setProcessingAuth(false);
        }
      }
    };

    handleAsgardeoAuth();
  }, [asgardeoState.isAuthenticated, user, processingAuth, getIDToken]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
      }
      setUser(response.user);
      notifications.show({
        title: 'Success',
        message: 'Logged in successfully',
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error?.message || 'Login failed',
        color: 'red',
      });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
      }
      setUser(response.user);
      notifications.show({
        title: 'Success',
        message: 'Account created successfully',
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error?.message || 'Registration failed',
        color: 'red',
      });
      throw error;
    }
  };

  const handleAsgardeoSignIn = async () => {
    try {
      await asgardeoSignIn();
    } catch (error) {
      console.error('❌ Failed to initiate Asgardeo sign-in:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to initiate sign in',
        color: 'red',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Sign out from Asgardeo
      await asgardeoSignOut();

      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      // Clear local state
      setUser(null);

      // Redirect to home
      router.push('/');

      notifications.show({
        title: 'Success',
        message: 'Logged out successfully',
        color: 'blue',
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if Asgardeo logout fails, clear local state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      setUser(null);
      router.push('/');
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isEditor = ['admin', 'editor'].includes(user?.role || '');
  const isAuthor = ['admin', 'editor', 'author'].includes(user?.role || '');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        asgardeoSignIn: handleAsgardeoSignIn,
        logout,
        isAuthenticated,
        isAdmin,
        isEditor,
        isAuthor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
