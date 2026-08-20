import * as React from "react";

import { api, tokenStore } from "@/lib/api";

export type User = {
  id: number;
  name: string;
  email: string;
  is_superuser: boolean;
  totp_enabled: boolean;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, totp?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  const loadMe = React.useCallback(async () => {
    if (!tokenStore.access) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<User>("/auth/me");
      setUser(data);
    } catch {
      tokenStore.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadMe();
  }, [loadMe]);

  const login = React.useCallback(
    async (email: string, password: string, totp?: string) => {
      const { data } = await api.post("/auth/login", {
        email,
        password,
        totp_code: totp || null,
      });
      tokenStore.set(data.access_token, data.refresh_token);
      const me = await api.get<User>("/auth/me");
      setUser(me.data);
    },
    [],
  );

  const logout = React.useCallback(() => {
    tokenStore.clear();
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
