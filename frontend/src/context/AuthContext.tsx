import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { api } from '@/api/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'proctor';
  profilePicture?: string | null;
  isIdVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshUserProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, _setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const refreshUserProfile = useCallback(async () => {
    // Check if we have a token
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const response = await api.get('/users/profile');
      const userData = response.data;
      console.log("Retrieved user profile from API:", userData);
      
      // Update localStorage with fresh data
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      _setUser(userData);
      return userData;
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            console.log("Loading user from localStorage:", parsedUser);
            _setUser(parsedUser);
            
            // Refresh profile in background to get latest data
            refreshUserProfile().catch(err => {
              console.error("Background profile refresh failed:", err);
            });
        } catch (e) {
            console.error("Failed to parse stored user:", e);
            localStorage.removeItem('user');
        }
    } else {
      // Try to refresh from token if available
      refreshUserProfile().catch(err => {
        console.error("Initial profile load failed:", err);
      });
    }
  }, [refreshUserProfile]);

  const setUser = useCallback((newUser: User | null) => {
    console.log("Setting user in context:", newUser);
    _setUser(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  }, [navigate, setUser]);

  const login = async (token: string) => {
    localStorage.setItem('token', token);
    try {
      const response = await api.get('/users/profile');
      const fullUser: User = response.data;
      console.log("Login successful, user data:", fullUser);
      
      // Make sure to store the full user data including profile picture
      setUser(fullUser);
      
      if (fullUser.role === 'student') {
          navigate('/student/dashboard');
      } else if (fullUser.role === 'proctor') {
          navigate('/proctor/dashboard');
      } else {
          navigate('/');
      }
    } catch (error) {
      console.error("Failed to decode token or fetch user:", error);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 