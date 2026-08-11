import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AdminAuthProvider } from "./auth/AdminAuthContext";
import { RedirectIfAuthenticated } from "./auth/RedirectIfAuthenticated";
import { RequireAuth } from "./auth/RequireAuth";
import { ToastHost } from "./components/ToastHost";
import { ToastProvider } from "./hooks/useToast";
import { AdminLayout } from "./layout/AdminLayout";
import { AboutPage } from "./pages/AboutPage";
import { BudgetPage } from "./pages/BudgetPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FaqPage } from "./pages/FaqPage";
import { FlashTattoosPage } from "./pages/FlashTattoosPage";
import { HomePage } from "./pages/HomePage";
import { LinkBioPage } from "./pages/LinkBioPage";
import { LoginPage } from "./pages/LoginPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ReformulacoesPage } from "./pages/ReformulacoesPage";
import { SupportPage } from "./pages/SupportPage";

export function AdminApp() {
  useEffect(() => {
    document.title = "Área administrativa | Karina Sarte";
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex,nofollow";
  }, []);

  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<RedirectIfAuthenticated />}>
              <Route path="/admin/login" element={<LoginPage />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="home" element={<HomePage />} />
                <Route path="sobre" element={<AboutPage />} />
                <Route path="portfolio" element={<PortfolioPage />} />
                <Route path="reformulacoes" element={<ReformulacoesPage />} />
                <Route path="flash-tattoos" element={<FlashTattoosPage />} />
                <Route path="produtos" element={<ProductsPage />} />
                <Route path="orcamento" element={<BudgetPage />} />
                <Route path="faq" element={<FaqPage />} />
                <Route path="link-bio" element={<LinkBioPage />} />
                <Route path="suporte" element={<SupportPage />} />
              </Route>
            </Route>
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          </Routes>
          <ToastHost />
        </ToastProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
