import { Navigate, Outlet, useLocation } from "react-router";
import { useAdminAuth } from "./AdminAuthContext";

export function RequireAuth() {
  const { status } = useAdminAuth();
  const location = useLocation();

  if (status === "checking") {
    return <div className="ksa-boot"><span className="ksa-loader" />Carregando área administrativa…</div>;
  }

  if (status !== "authenticated") {
    const from = location.pathname.startsWith("/admin") ? location.pathname : "/admin";
    return <Navigate to="/admin/login" replace state={{ from }} />;
  }

  return <Outlet />;
}
