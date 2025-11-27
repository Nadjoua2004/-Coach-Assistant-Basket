import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    const mockUsers = {
      'coach@club.dz': { id: 1, name: 'Mohamed Belaidi', role: 'coach', email: 'coach@club.dz' },
      'adjoint@club.dz': { id: 2, name: 'Karim Hamza', role: 'adjoint', email: 'adjoint@club.dz' },
      'admin@club.dz': { id: 3, name: 'Admin User', role: 'admin', email: 'admin@club.dz' },
      'joueur@club.dz': { id: 4, name: 'Yacine Touri', role: 'joueur', email: 'joueur@club.dz' },
      'parent@club.dz': { id: 5, name: 'Fatima Mansouri', role: 'parent', email: 'parent@club.dz' }
    };
    
    const foundUser = mockUsers[email];
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};