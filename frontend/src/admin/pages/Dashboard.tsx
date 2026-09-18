import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Images, KeyRound, LinkIcon, RefreshCw, Sparkles, ShoppingBag } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { AboutSettings } from "../AboutSettings";
import { ConstructionSwitch } from "../ConstructionSwitch";
import { YoutubeSettings } from "../YoutubeSettings";
import { ProductsHeroSettings } from "../ProductsHeroSettings";
import { listGallery, type GalleryCollectionId, type GalleryItem } from "../auth/api";
import { COLLECTION_LIST, isIncompleteReformulation } from "../gallery/collections";

const ICONS: Record<GalleryCollectionId, typeof Images> = {
  portfolio: Images,
  flash: Sparkles,
  produtos: ShoppingBag,
  reformulacoes: RefreshCw,
};

export function DashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Partial<Record<GalleryCollectionId, number>>>({});
  const [pending, setPending] = useState<Partial<Record<GalleryCollectionId, number>>>({});

  useEffect(() => {
    let active = true;
    void Promise.all(
      COLLECTION_LIST.map(async (c) => {
        try {
          const data = await listGallery(c.id);
          const items = data.items as GalleryItem[];
          const pendingCount =
            c.imageMode === "before-after"
              ? items.filter(isIncompleteReformulation).length
              : 0;
          return [c.id, items.length, pendingCount] as const;
        } catch {
          return [c.id, 0, 0] as const;
        }
      }),
    ).then((rows) => {
      if (!active) return;
      const nextCounts: Partial<Record<GalleryCollectionId, number>> = {};
      const nextPending: Partial<Record<GalleryCollectionId, number>> = {};
      for (const [id, n, p] of rows) {
        nextCounts[id] = n;
        nextPending[id] = p;
      }
      setCounts(nextCounts);
      setPending(nextPending);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="ks-admin-shell">
      <header className="ks-admin-brand">
        <p className="ks-admin-kicker">Visão geral</p>
        <h1 className="ks-admin-title">Suas galerias</h1>
        <p className="ks-admin-lead">
          Adicione e organize fotos do portfólio, flashes, produtos e reformulações.
        </p>
      </header>

      <section className="ks-admin-construction" aria-labelledby="ks-dash-construction">
        <div>
          <p className="ks-admin-kicker">Site público</p>
          <h2 id="ks-dash-construction">Site em construção</h2>
          <p>
            Ligado, o restante do site mostra o aviso. A página de links continua no ar.
          </p>
          <a href="/bio" target="_blank" rel="noopener noreferrer">
            Abrir a página de links
          </a>
        </div>
        <ConstructionSwitch labelledBy="ks-dash-construction" />
      </section>

      <YoutubeSettings />

      <ProductsHeroSettings />

      <AboutSettings />

      <nav className="ks-admin-nav-cards ks-gallery-dash" aria-label="Galerias">
        {COLLECTION_LIST.map((c) => {
          const Icon = ICONS[c.id];
          const n = counts[c.id];
          const p = pending[c.id] ?? 0;
          return (
            <Link key={c.id} className="ks-admin-card-link" to={c.path}>
              <span className="ks-admin-card-icon">
                <Icon size={22} />
              </span>
              <span className="ks-admin-card-title">{c.label}</span>
              <span className="ks-admin-card-text">
                {typeof n === "number"
                  ? n === 0
                    ? "Nenhum item ainda"
                    : (
                      <>
                        <span className="ks-admin-num">{n}</span>
                        {` ${n === 1 ? "item" : "itens"}`}
                        {p > 0 ? (
                          <>
                            {" · "}
                            <span className="ks-admin-pending-count">
                              {p === 1 ? "1 aguardando depois" : `${p} aguardando depois`}
                            </span>
                          </>
                        ) : null}
                      </>
                    )
                  : "Carregando…"}
              </span>
              <span className="ks-admin-card-action">
                Abrir galeria <ArrowRight size={17} />
              </span>
            </Link>
          );
        })}
      </nav>

      <p className="ks-admin-footnote ks-gallery-dash-foot">
        <Link to="/admin/bio-links">
          <LinkIcon size={14} /> Links da bio
        </Link>
        {" · "}
        <Link to="/admin/senha">
          <KeyRound size={14} /> Trocar senha
        </Link>
        {user?.role === "owner" ? (
          <>
            {" · "}
            <Link to="/admin/usuarios">Usuários</Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
