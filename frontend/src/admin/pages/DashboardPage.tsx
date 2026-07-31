import { ArrowRight, CircleHelp, GalleryVerticalEnd, Package, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AdminCard, AdminPage } from "../components/Primitives";
import { LoadingState } from "../components/States";
import { StarDecor } from "../components/StarDecor";
import { faqStore, flashStore, portfolioStore, productsStore } from "../data/stores";

export function DashboardPage() {
  const [counts, setCounts] = useState<{ portfolio: number; flashes: number; products: number; faq: number } | null>(null);
  useEffect(() => { void Promise.all([portfolioStore.list(), flashStore.list(), productsStore.list(), faqStore.list()]).then(([portfolio, flashes, products, faq]) => setCounts({ portfolio: portfolio.filter((item) => item.status === "Publicado").length, flashes: flashes.filter((item) => item.status === "Disponível").length, products: products.filter((item) => item.active).length, faq: faq.filter((item) => item.active).length })); }, []);
  return <AdminPage eyebrow="Visão geral" title="Bem-vinda, Karina" description="Aqui está um retrato rápido do conteúdo que está pronto para aparecer no site."><div className="ksa-dashboard-hero"><StarDecor /><p>Escolha uma seção para editar. Nesta etapa, as mudanças ficam salvas como rascunho neste navegador.</p></div>{!counts ? <LoadingState /> : <div className="ksa-stats"><Stat icon={<GalleryVerticalEnd />} value={counts.portfolio} label="Trabalhos publicados" /><Stat icon={<Sparkles />} value={counts.flashes} label="Flashes disponíveis" /><Stat icon={<Package />} value={counts.products} label="Produtos ativos" /><Stat icon={<CircleHelp />} value={counts.faq} label="Perguntas no FAQ" /></div>}<AdminCard title="Atalhos frequentes" description="Vá direto ao conteúdo que muda com mais frequência."><div className="ksa-quick-links">{[["Adicionar trabalho", "/admin/portfolio"], ["Atualizar flashes", "/admin/flash-tattoos"], ["Editar Home", "/admin/home"], ["Revisar produtos", "/admin/produtos"], ["Abrir mídia", "/admin/midia"]].map(([label, to]) => <Link key={to} to={to}>{label}<ArrowRight size={16} /></Link>)}</div></AdminCard></AdminPage>;
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) { return <article className="ksa-stat"><span>{icon}</span><strong>{value}</strong><p>{label}</p></article>; }
