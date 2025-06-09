import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '@/api/services/AuthService';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  name?: string; // Computed property
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Restore user and isAuthenticated from localStorage for instant UI feedback
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      // Try to get current user from API
      const userData = await authService.getCurrentUser();
      const userWithName = {
        ...userData,
        name: `${userData.firstName} ${userData.lastName}`.trim()
      };
      setUser(userWithName);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userWithName));
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.Login(email, password);
      const userWithName = {
        ...response.user,
        name: `${response.user.firstName} ${response.user.lastName}`.trim()
      };
      setUser(userWithName);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userWithName));
      localStorage.setItem('isAuthenticated', 'true');
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw to handle in component
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      logout, 
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};