import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ApiError,
  changePassword as apiChangePassword,
  fetchSession,
  login as apiLogin,
  logout as apiLogout,
  type AdminSessionUser,
} from "./api";

type AuthState = {
  loading: boolean;
  user: AdminSessionUser | null;
  mustChangePassword: boolean;
  login: (email: string, password: string) => Promise<{ mustChangePassword: boolean }>;
  logout: () => Promise<void>;
  changePassword: (input: {
    currentPassword?: string;
    newPassword: string;
  }) => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AdminSessionUser | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const applyUser = useCallback((next: AdminSessionUser | null, mustChange?: boolean) => {
    setUser(next);
    setMustChangePassword(
      mustChange ?? Boolean(next?.mustChangePassword),
    );
  }, []);

  const refresh = useCallback(async () => {
    try {
      const session = await fetchSession();
      if (!session.authenticated) {
        applyUser(null, false);
        return;
      }
      applyUser(session.user, session.mustChangePassword);
    } catch {
      applyUser(null, false);
    }
  }, [applyUser]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const session = await fetchSession();
        if (!active) return;
        if (!session.authenticated) applyUser(null, false);
        else applyUser(session.user, session.mustChangePassword);
      } catch {
        if (active) applyUser(null, false);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [applyUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await apiLogin(email, password);
      applyUser(result.user, result.mustChangePassword);
      return { mustChangePassword: result.mustChangePassword };
    },
    [applyUser],
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
    }
    applyUser(null, false);
  }, [applyUser]);

  const changePassword = useCallback(
    async (input: { currentPassword?: string; newPassword: string }) => {
      const result = await apiChangePassword(input);
      applyUser(result.user, result.mustChangePassword);
    },
    [applyUser],
  );

  const value = useMemo<AuthState>(
    () => ({
      loading,
      user,
      mustChangePassword,
      login,
      logout,
      changePassword,
      refresh,
    }),
    [loading, user, mustChangePassword, login, logout, changePassword, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}
