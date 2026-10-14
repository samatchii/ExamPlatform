import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('exam_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const login = async (email, password) => {
    setLoading(true);
    try {
      const u = await api.login(email, password);
      setUser(u);
      localStorage.setItem('exam_user', JSON.stringify(u));
      return u;
    } finally {
      setLoading(false);
    }
  };
  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const u = await api.register(name, email, password, role);
      if (u && u.pending) {
        return u;
      }
      setUser(u);
      localStorage.setItem('exam_user', JSON.stringify(u));
      return u;
    } finally {
      setLoading(false);
    }
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('exam_user');
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      { /* Les composants enfants (toute l'application) peuvent accéder au contexte via useAuth() */ }
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
