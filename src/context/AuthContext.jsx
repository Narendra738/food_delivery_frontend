import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('zestro_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Also ensure token is stored
        if (parsedUser.token) {
          localStorage.setItem('zestro_token', parsedUser.token);
        }
      } catch (e) {
        localStorage.removeItem('zestro_user');
        localStorage.removeItem('zestro_token');
      }
    }
    setLoading(false);
  }, []);

  const signup = (userData) => {
    // This is now called from Signup component after backend API call
    // userData should already have token and proper role mapping
    setUser(userData);
    return userData;
  };

  const login = (userData) => {
    // This is now called from Login component after backend API call
    // userData should already have token and proper role mapping
    setUser(userData);
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zestro_user');
    localStorage.removeItem('zestro_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
