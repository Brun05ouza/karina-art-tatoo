import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  getAdminSession,
  loginAdmin,
  loginAdminDevelopment,
  logoutAdmin,
  type AdminUser,
  type SessionResponse,
} from "./adminApi";

type AuthStatus = "checking" | "anonymous" | "authenticated";

type AdminAuthValue = {
  status: AuthStatus;
  user: AdminUser | null;
  devLoginAvailable: boolean;
  serverUnavailable: boolean;
  login(email: string, password: string): Promise<void>;
  devLogin(): Promise<void>;
  logout(): Promise<void>;
  retry(): Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [devLoginAvailable, setDevLoginAvailable] = useState(false);
  const [serverUnavailable, setServerUnavailable] = useState(false);
  const checked = useRef(false);

  const applySession = useCallback((session: SessionResponse) => {
    setUser(session.user ?? null);
    setStatus(session.authenticated ? "authenticated" : "anonymous");
    setDevLoginAvailable(session.devLoginAvailable);
    setServerUnavailable(false);
  }, []);

  const retry = useCallback(async () => {
    setStatus("checking");
    try {
      applySession(await getAdminSession());
    } catch {
      setStatus("anonymous");
      setUser(null);
      setServerUnavailable(true);
    }
  }, [applySession]);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    void retry();
  }, [retry]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setStatus("anonymous");
    };
    window.addEventListener("ksa:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("ksa:unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    applySession(await loginAdmin(email, password));
  }, [applySession]);

  const devLogin = useCallback(async () => {
    applySession(await loginAdminDevelopment());
  }, [applySession]);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } finally {
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ status, user, devLoginAvailable, serverUnavailable, login, devLogin, logout, retry }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error("useAdminAuth precisa estar dentro de AdminAuthProvider.");
  return value;
}
