import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const token = localStorage.getItem("signguy.token");
      if (!token) {
        setUser(null); setTenant(null); setPermissions([]);
        setLoading(false);
        return;
      }
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      setTenant(data.tenant);
      setPermissions(data.permissions || []);
    } catch (e) {
      setUser(null); setTenant(null); setPermissions([]);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("signguy.token", data.access_token);
    setUser(data.user); setTenant(data.tenant); setPermissions(data.permissions || []);
    return data;
  }, []);

  const registerTenant = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register-tenant", payload);
    localStorage.setItem("signguy.token", data.access_token);
    setUser(data.user); setTenant(data.tenant); setPermissions(data.permissions || []);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    localStorage.removeItem("signguy.token");
    setUser(null); setTenant(null); setPermissions([]);
    window.location.href = "/login";
  }, []);

  const value = useMemo(() => ({
    user, tenant, permissions, loading, error,
    hasPerm: (perm) => permissions.includes(perm),
    hasAny: (list) => list.some((p) => permissions.includes(p)),
    refresh, login, registerTenant, logout,
  }), [user, tenant, permissions, loading, error, refresh, login, registerTenant, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
