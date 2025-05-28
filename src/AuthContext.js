import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const mockUsers = [
  {
    id: 1,
    email: '111111@edu.p.lodz.pl',
    password: 'password123',
    name: 'John Doe',
    role: 'student',
    preferences: {
      dietary: ['vegetarian'],
      priceRange: 'low',
      notifications: true
    },
    favoriteLocations: [1, 3]
  },
  {
    id: 2,
    email: 'admin@edu.p.lodz.pl',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    preferences: {
      dietary: [],
      priceRange: 'all',
      notifications: true
    },
    favoriteLocations: []
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('campusFoodFinder_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const userWithoutPassword = { ...foundUser };
      delete userWithoutPassword.password;
      setUser(userWithoutPassword);
      localStorage.setItem('campusFoodFinder_user', JSON.stringify(userWithoutPassword));
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const register = async (userData) => {
    const newUser = {
      id: Date.now(),
      ...userData,
      role: 'student',
      preferences: {
        dietary: [],
        priceRange: 'all',
        notifications: true
      },
      favoriteLocations: []
    };
    
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    setUser(userWithoutPassword);
    localStorage.setItem('campusFoodFinder_user', JSON.stringify(userWithoutPassword));
    return { success: true };
  };

	const logout = () => {
	  setUser(null);
	  localStorage.removeItem('campusFoodFinder_user');

	  if (window.closeModal) {
		window.closeModal();
	  }
	};

  const updatePreferences = (newPreferences) => {
    const updatedUser = { ...user, preferences: { ...user.preferences, ...newPreferences } };
    setUser(updatedUser);
    localStorage.setItem('campusFoodFinder_user', JSON.stringify(updatedUser));
  };

  const toggleFavorite = (locationId) => {
    if (!user) return;
    
    const favorites = user.favoriteLocations || [];
    const newFavorites = favorites.includes(locationId)
      ? favorites.filter(id => id !== locationId)
      : [...favorites, locationId];
    
    const updatedUser = { ...user, favoriteLocations: newFavorites };
    setUser(updatedUser);
    localStorage.setItem('campusFoodFinder_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updatePreferences,
    toggleFavorite,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};