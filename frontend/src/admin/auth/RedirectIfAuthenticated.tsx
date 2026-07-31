import { Navigate, Outlet } from "react-router";
import { useAdminAuth } from "./AdminAuthContext";

export function RedirectIfAuthenticated() {
  const { status } = useAdminAuth();
  if (status === "checking") return <div className="ksa-boot"><span className="ksa-loader" />Verificando sessão…</div>;
  if (status === "authenticated") return <Navigate to="/admin" replace />;
  return <Outlet />;
}
