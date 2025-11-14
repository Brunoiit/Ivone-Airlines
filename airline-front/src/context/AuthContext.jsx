import { createContext, useState, useContext, useEffect } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    
    if (token && userId) {
      setIsAuthenticated(true);
      setUserRole(userRole);
      setUser({
        user_id: userId,
        role: userRole,
        name: userName
      });
    }
  }, []);

  const login = (userData) => {
    console.log("[v0] Login called with userData:", userData);
    
    if (userData && userData.access_token) {
      localStorage.setItem('token', userData.access_token);
      localStorage.setItem('userId', userData.user_id);
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userName', userData.email || 'User');
      
      setUser({
        user_id: userData.user_id,
        role: userData.role,
        name: userData.email,
        email: userData.email
      });
      setIsAuthenticated(true);
      setUserRole(userData.role);
      console.log("[v0] Login successful, user:", userData);
      return { success: true };
    }
    console.log("[v0] Login failed - missing access_token");
    return { success: false, error: 'Invalid user data' };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setUser(null);
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      userRole,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};