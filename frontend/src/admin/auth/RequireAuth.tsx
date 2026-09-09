import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

export function RequireAuth({
  children,
  ownerOnly = false,
}: {
  children: ReactNode;
  ownerOnly?: boolean;
}) {
  const { loading, user, mustChangePassword } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="ks-admin-loading" role="status">
        Carregando…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (mustChangePassword && location.pathname !== "/admin/senha") {
    return <Navigate to="/admin/senha" replace />;
  }

  if (ownerOnly && user.role !== "owner") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
