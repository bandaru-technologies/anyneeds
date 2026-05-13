import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  phoneNumber: string;
  name?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('salepe_user').then((stored) => {
      if (stored) setUser(JSON.parse(stored));
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (token: string, userData: User) => {
    await AsyncStorage.setItem('salepe_token', token);
    await AsyncStorage.setItem('salepe_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['salepe_token', 'salepe_user']);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (userData: User) => {
    await AsyncStorage.setItem('salepe_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
