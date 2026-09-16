import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Images, KeyRound, LinkIcon, Sparkles, ShoppingBag } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { ConstructionSwitch } from "../ConstructionSwitch";
import { listGallery, type GalleryCollectionId } from "../auth/api";
import { COLLECTION_LIST } from "../gallery/collections";

const ICONS: Record<GalleryCollectionId, typeof Images> = {
  portfolio: Images,
  flash: Sparkles,
  produtos: ShoppingBag,
};

export function DashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Partial<Record<GalleryCollectionId, number>>>({});

  useEffect(() => {
    let active = true;
    void Promise.all(
      COLLECTION_LIST.map(async (c) => {
        try {
          const data = await listGallery(c.id);
          return [c.id, data.items.length] as const;
        } catch {
          return [c.id, 0] as const;
        }
      }),
    ).then((pairs) => {
      if (!active) return;
      const next: Partial<Record<GalleryCollectionId, number>> = {};
      for (const [id, n] of pairs) next[id] = n;
      setCounts(next);
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
          Adicione e organize fotos do portfólio, flashes e produtos.
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

      <nav className="ks-admin-nav-cards ks-gallery-dash" aria-label="Galerias">
        {COLLECTION_LIST.map((c) => {
          const Icon = ICONS[c.id];
          const n = counts[c.id];
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
