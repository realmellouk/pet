// context/AuthContext.jsx — Global auth state with React Context
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('pm_user')); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const saveSession = (token, userData) => {
    localStorage.setItem('pm_token', token);
    localStorage.setItem('pm_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    saveSession(data.token, data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    saveSession(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('pm_token');
    localStorage.removeItem('pm_user');
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('pm_token')) return;
    try {
      const { data } = await authAPI.me();
      setUser(data.user);
      localStorage.setItem('pm_user', JSON.stringify(data.user));
    } catch {
      logout();
    }
  }, []);

  useEffect(() => { refreshUser(); }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
