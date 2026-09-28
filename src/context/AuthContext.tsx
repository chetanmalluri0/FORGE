import React, { createContext, useContext, useEffect, useState } from 'react';
import { getRedirectResult, signInWithRedirect } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { api } from '../services/api.ts';
import { AdminUser, User } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  loading: boolean;
  redirectError: { code?: string; message: string } | null;
  clearRedirectError: () => void;
  loginCustomer: (email: string, pass: string) => Promise<void>;
  registerCustomer: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    fitnessGoal?: string;
    age?: number;
  }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAdmin: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectError, setRedirectError] = useState<{ code?: string; message: string } | null>(null);

  const clearRedirectError = () => {
    setRedirectError(null);
  };

  const initAuth = async () => {
    try {
      // 1. Process Google OAuth redirect result if returning from signInWithRedirect
      try {
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult && redirectResult.user) {
          const token = await redirectResult.user.getIdToken();
          localStorage.setItem('forge_token', token);
          localStorage.removeItem('forge_admin_user');

          // Sync user profile in PostgreSQL database
          const userRes = await api.getMe();
          setUser(userRes.user);
          setAdminUser(null);
          setLoading(false);
          return;
        }
      } catch (redirectErr: any) {
        console.error('Firebase getRedirectResult error:', redirectErr);
        setRedirectError({
          code: redirectErr?.code || 'auth/redirect-error',
          message: redirectErr?.message || 'Failed to complete Google Sign-In redirect.',
        });
      }

      // 2. Check saved session token in localStorage
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

  const loginWithGoogle = async () => {
    // Initiate Google Sign-In via full-page redirect
    await signInWithRedirect(auth, googleAuthProvider);
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
        redirectError,
        clearRedirectError,
        loginCustomer,
        registerCustomer,
        loginWithGoogle,
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
