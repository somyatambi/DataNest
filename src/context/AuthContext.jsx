import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getMe()
        .then(res => { if (res.success) setUser(res.user); })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signup = async (data) => {
    try {
      const res = await authAPI.signup(data);
      localStorage.setItem('token', res.token);
      setUser(res.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Signup failed' };
    }
  };

  const login = async (data) => {
    try {
      const res = await authAPI.login(data);
      localStorage.setItem('token', res.token);
      setUser(res.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    authAPI.logout().catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
