"use client";

import { createContext, useContext } from "react";

interface AuthContextValue {
  user: { publicMetadata?: Record<string, unknown> } | null;
  isLoaded: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoaded: false,
});

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
