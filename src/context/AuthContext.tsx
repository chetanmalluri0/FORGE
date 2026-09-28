import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.ts';
import { AdminUser, User } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  loading: boolean;
  loginCustomer: (email: string, pass: string) => Promise<void>;
  registerCustomer: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    fitnessGoal?: string;
    age?: number;
  }) => Promise<void>;
  loginAdmin: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    try {
      const token = localStorage.getItem('forge_token');
      const savedAdmin = localStorage.getItem('forge_admin_user');

      if (token) {
        if (savedAdmin) {
          try {
            const adminRes = await api.getAdminMe();
            setAdminUser(adminRes.admin);
          } catch (e) {
            localStorage.removeItem('forge_admin_user');
            localStorage.removeItem('forge_token');
          }
        } else {
          try {
            const userRes = await api.getMe();
            setUser(userRes.user);
          } catch (e) {
            localStorage.removeItem('forge_token');
          }
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const loginCustomer = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    localStorage.setItem('forge_token', res.token);
    localStorage.removeItem('forge_admin_user');
    setUser(res.user);
    setAdminUser(null);
  };

  const registerCustomer = async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    fitnessGoal?: string;
    age?: number;
  }) => {
    const res = await api.register(payload);
    localStorage.setItem('forge_token', res.token);
    localStorage.removeItem('forge_admin_user');
    setUser(res.user);
    setAdminUser(null);
  };

  const loginAdmin = async (email: string, pass: string) => {
    const res = await api.adminLogin({ email, password: pass });
    localStorage.setItem('forge_token', res.token);
    localStorage.setItem('forge_admin_user', JSON.stringify(res.admin));
    setAdminUser(res.admin);
    setUser(null);
  };

  const logout = async () => {
    await api.logout().catch(() => {});
    localStorage.removeItem('forge_token');
    localStorage.removeItem('forge_admin_user');
    setUser(null);
    setAdminUser(null);
  };

  const refreshUser = async () => {
    if (adminUser) {
      const res = await api.getAdminMe();
      setAdminUser(res.admin);
    } else {
      const res = await api.getMe();
      setUser(res.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        adminUser,
        loading,
        loginCustomer,
        registerCustomer,
        loginAdmin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
