"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { auth } from "../lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const session = await auth.getSession();
        if (active) setUser(session);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadSession();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload) => {
    const result = await auth.login(payload);
    if (result.ok && result.user) setUser(result.user);
    return result;
  }, []);

  const register = useCallback(async (payload) => {
    // Registration never establishes a session (the account has to be logged
    // into explicitly), so the auth context is left untouched here.
    return auth.register(payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const updateUser = useCallback(async (payload) => {
    const result = await auth.updateProfile(payload);
    if (result.ok && result.user) setUser(result.user);
    return result;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, isLoading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
