import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState({
    id: localStorage.getItem('campus_active_user_id') || '11111111-1111-1111-1111-111111111111',
    email: 'alex.chen@campus.edu',
    full_name: 'Alex Chen',
    role: 'student'
  });
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const [meRes, listRes] = await Promise.all([
          api.getMe(),
          api.getDemoUsers()
        ]);
        if (meRes.user) setCurrentUser(meRes.user);
        if (listRes.demoUsers) setDemoUsers(listRes.demoUsers);
      } catch (err) {
        console.warn('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const switchUser = (newUser) => {
    setCurrentUser(newUser);
    localStorage.setItem('campus_active_user_id', newUser.id);
    // Reload or trigger refetch
    window.dispatchEvent(new Event('campus_user_switched'));
  };

  return (
    <AuthContext.Provider value={{ currentUser, demoUsers, switchUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
