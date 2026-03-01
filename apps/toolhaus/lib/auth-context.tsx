"use client";

import { createContext, useContext } from "react";

interface AuthContextValue {
  user: { publicMetadata?: { plan?: string } } | null;
  isLoaded: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoaded: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };
