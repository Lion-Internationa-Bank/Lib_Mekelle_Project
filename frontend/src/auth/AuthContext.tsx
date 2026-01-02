// src/auth/AuthContext.tsx
import React, { createContext, useContext, useState,  } from "react";
import type {ReactNode } from "react";

type Role = "Admin" | "Clerk" | "Viewer";

interface User {
  username: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Static credentials (demo)
const STATIC_USER = {
  username: "mekele_admin",
  password: "123456",
  role: "Admin" as Role,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string) => {
    if (username === STATIC_USER.username && password === STATIC_USER.password) {
      setUser({ username: STATIC_USER.username, role: STATIC_USER.role });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
