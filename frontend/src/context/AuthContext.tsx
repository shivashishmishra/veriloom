import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: AuthResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  switchRole: (role: 'creator' | 'reviewer' | 'admin') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    const saved = localStorage.getItem('veriloom_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const saveAuth = (authData: AuthResponse) => {
    setUser(authData);
    localStorage.setItem('veriloom_token', authData.access_token);
    localStorage.setItem('veriloom_user', JSON.stringify(authData));
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const authData = await api.login(email, password);
      saveAuth(authData);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (role: 'creator' | 'reviewer' | 'admin') => {
    setLoading(true);
    try {
      const authData = await api.demoSwitch(role);
      saveAuth(authData);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('veriloom_token');
    localStorage.removeItem('veriloom_user');
  };

  // If no user on start, automatically log in as Creator for instant judge evaluation
  useEffect(() => {
    if (!user) {
      switchRole('creator').catch(() => {});
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        switchRole,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
