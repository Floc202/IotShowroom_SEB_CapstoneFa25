import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for demo
// Tài khoản demo:
// Admin: admin@iot.edu / admin123
// Instructor: instructor@iot.edu / instructor123
// Student: student@iot.edu / student123

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Nguyễn Văn Admin',
    email: 'admin@iot.edu',
    role: 'admin',
    phone: '0901234567',
    createdAt: '2024-09-01T00:00:00Z',
    status: 'active',
  },
  {
    id: '2',
    name: 'TS. Trần Thị Hương',
    email: 'instructor@iot.edu',
    role: 'instructor',
    phone: '0912345678',
    createdAt: '2024-09-01T00:00:00Z',
    status: 'active',
  },
  {
    id: '3',
    name: 'Lê Minh Student',
    email: 'student@iot.edu',
    role: 'student',
    phone: '0923456789',
    createdAt: '2024-09-15T00:00:00Z',
    status: 'active',
  },
];

const DEMO_PASSWORD = {
  'admin@iot.edu': 'admin123',
  'instructor@iot.edu': 'instructor123',
  'student@iot.edu': 'student123',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check credentials
    const validPassword = DEMO_PASSWORD[email as keyof typeof DEMO_PASSWORD];
    if (!validPassword || validPassword !== password) {
      setIsLoading(false);
      return false;
    }
    
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};