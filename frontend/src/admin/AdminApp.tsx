import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import { ChangePasswordPage } from "./pages/ChangePassword";
import { DashboardPage } from "./pages/Dashboard";
import { LoginPage } from "./pages/Login";
import { UsersPage } from "./pages/Users";
import "./admin.css";

function AdminSeo() {
  useEffect(() => {
    const prevTitle = document.title;
    const robots = document.querySelector('meta[name="robots"]');
    const prevRobots = robots?.getAttribute("content") ?? null;

    document.title = "Admin | Karina Sarte";
    if (robots) robots.setAttribute("content", "noindex, nofollow");
    else {
      const el = document.createElement("meta");
      el.name = "robots";
      el.content = "noindex, nofollow";
      document.head.appendChild(el);
    }

    document.documentElement.classList.add("ks-admin-root");

    return () => {
      document.title = prevTitle;
      document.documentElement.classList.remove("ks-admin-root");
      const current = document.querySelector('meta[name="robots"]');
      if (current) {
        if (prevRobots) current.setAttribute("content", prevRobots);
        else current.setAttribute("content", "index, follow");
      }
    };
  }, []);
  return null;
}

export function AdminApp() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminSeo />
        <div className="ks-admin-app">
          <Routes>
            <Route path="/admin/login" element={<LoginPage />} />
            <Route
              path="/admin/senha"
              element={
                <RequireAuth>
                  <ChangePasswordPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                <RequireAuth ownerOnly>
                  <UsersPage />
                </RequireAuth>
              }
            />
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
