import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const login = (authData) => {
    setToken(authData.access_token);
    setUser({
      id: authData.user_id,
      role: authData.role,
      email: authData.email,
    });

    localStorage.setItem("token", authData.access_token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: authData.user_id,
        role: authData.role,
        email: authData.email,
      })
    );
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
