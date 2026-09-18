import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ChevronDown, ChevronUp, Pencil, Star, Trash2 } from "lucide-react";
import {
  ApiError,
  createGalleryItem,
  deleteGalleryItem,
  listGallery,
  patchGalleryItem,
  reorderGallery,
  type GalleryItem,
} from "../auth/api";
import {
  COLLECTIONS,
  isIncompleteReformulation,
  type GalleryCollectionId,
} from "./collections";
import { ItemForm, type ItemFormSavePayload } from "./ItemForm";
import { focalStyle } from "../../app/focal";

type Mode = { type: "list" } | { type: "create" } | { type: "edit"; item: GalleryItem };

type FeaturedSwap = {
  candidate: GalleryItem;
  current: GalleryItem;
};

export function GalleryPage({ collectionId }: { collectionId: GalleryCollectionId }) {
  const config = COLLECTIONS[collectionId];
  const beforeAfter = config.imageMode === "before-after";
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ type: "list" });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [featuredSwap, setFeaturedSwap] = useState<FeaturedSwap | null>(null);
  const supportsFeatured = true;

  const displayItems = useMemo(() => {
    if (!beforeAfter) return items;
    return [...items].sort((a, b) => {
      const aPending = isIncompleteReformulation(a);
      const bPending = isIncompleteReformulation(b);
      if (aPending !== bPending) return aPending ? -1 : 1;
      return a.sort_order - b.sort_order;
    });
  }, [items, beforeAfter]);

  const pendingCount = useMemo(
    () => (beforeAfter ? items.filter(isIncompleteReformulation).length : 0),
    [items, beforeAfter],
  );

  const reload = useCallback(async () => {
    setError(null);
    try {
      const data = await listGallery(collectionId);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar a galeria.");
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    setLoading(true);
    setMode({ type: "list" });
    setNotice(null);
    setFeaturedSwap(null);
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 2800);
    return () => window.clearTimeout(t);
  }, [notice]);

  async function saveItem(payload: ItemFormSavePayload) {
    const v = payload.values;
    const published = v.published;
    const featured = published ? v.featured : false;
    const base: Record<string, unknown> = {
      title: v.title.trim(),
      alt_text: v.alt_text.trim() || null,
      published,
      featured,
      show_in_recent: v.show_in_recent,
      focalX: payload.focal.x,
      focalY: payload.focal.y,
    };
    if (config.fields.includes("category")) base.category = v.category.trim() || null;
    if (config.fields.includes("price")) base.price = v.price.trim() || null;
    if (config.fields.includes("link")) base.link = v.link.trim() || null;
    if (config.fields.includes("status")) base.status = v.status;

    if (beforeAfter) {
      base.afterFocalX = payload.afterFocal.x;
      base.afterFocalY = payload.afterFocal.y;
      if (payload.afterImage) {
        base.after_image_url = payload.afterImage.imageUrl;
        base.after_image_key = payload.afterImage.imageKey;
      }
    }

    if (mode.type === "edit") {
      if (payload.image) {
        base.image_url = payload.image.imageUrl;
        base.image_key = payload.image.imageKey;
      }
      await patchGalleryItem(mode.item.id, base);
    } else {
      if (!payload.image) throw new Error(beforeAfter ? "Escolha a foto do antes." : "Escolha uma foto.");
      base.image_url = payload.image.imageUrl;
      base.image_key = payload.image.imageKey;
      const { item } = await createGalleryItem(collectionId, base);
      if (featured) {
        await patchGalleryItem(item.id, { featured: true });
      }
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const index = displayItems.findIndex((i) => i.id === id);
    const next = index + dir;
    if (index < 0 || next < 0 || next >= displayItems.length) return;
    const ids = displayItems.map((i) => i.id);
    const tmp = ids[index]!;
    ids[index] = ids[next]!;
    ids[next] = tmp;
    setBusyId(id);
    setError(null);
    try {
      await reorderGallery(collectionId, ids);
      await reload();
      setNotice("Ordem atualizada.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível reordenar.");
    } finally {
      setBusyId(null);
    }
  }

  async function applyFeatured(item: GalleryItem, nextFeatured: boolean) {
    setBusyId(item.id);
    setError(null);
    try {
      const { item: updated } = await patchGalleryItem(item.id, {
        featured: nextFeatured,
      });
      setItems((prev) =>
        prev.map((row) => {
          if (row.id === updated.id) return { ...row, ...updated };
          if (nextFeatured && row.featured) return { ...row, featured: false };
          return row;
        }),
      );
      setNotice(nextFeatured ? `“${item.title}” agora é o destaque.` : "Destaque removido.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível atualizar o destaque.");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleFeatured(item: GalleryItem) {
    if (!supportsFeatured) return;
    if (!item.published && !item.featured) {
      setError(
        "Não dá para destacar um item oculto. Publique-o primeiro e depois marque como destaque.",
      );
      return;
    }
    const nextFeatured = !item.featured;
    if (nextFeatured) {
      const current = items.find((row) => row.featured && row.id !== item.id);
      if (current) {
        setFeaturedSwap({ candidate: item, current });
        return;
      }
    }
    await applyFeatured(item, nextFeatured);
  }

  async function confirmFeaturedSwap() {
    if (!featuredSwap) return;
    const { candidate } = featuredSwap;
    setFeaturedSwap(null);
    await applyFeatured(candidate, true);
  }

  async function remove(item: GalleryItem) {
    const ok = window.confirm(`Remover “${item.title}”? Essa ação não dá para desfazer.`);
    if (!ok) return;
    setBusyId(item.id);
    setLeavingId(item.id);
    setError(null);
    try {
      await deleteGalleryItem(item.id);
      await reload();
      setNotice(`“${item.title}” removido.`);
    } catch (err) {
      setLeavingId(null);
      setError(err instanceof ApiError ? err.message : "Não foi possível remover.");
    } finally {
      setBusyId(null);
    }
  }

  function metaLine(item: GalleryItem): string {
    const parts: string[] = [];
    if (beforeAfter && isIncompleteReformulation(item)) parts.push("Aguardando depois");
    if (item.featured) parts.push("Destaque");
    if (item.show_in_recent === false) parts.push("Fora dos recentes");
    if (!item.published) parts.push("Oculto");
    if (item.category) parts.push(item.category);
    if (item.price) parts.push(item.price);
    if (item.status === "vendido") parts.push("Vendido");
    else if (item.status === "disponivel") parts.push("Disponível");
    return parts.join(" · ");
  }

  if (mode.type === "create" || mode.type === "edit") {
    return (
      <div className="ks-admin-shell">
        <header className="ks-admin-brand">
          <p className="ks-admin-kicker">
            <Link
              to={config.path}
              className="ks-admin-back"
              onClick={(e) => {
                e.preventDefault();
                setMode({ type: "list" });
              }}
            >
              ← {config.label}
            </Link>
          </p>
          <h1 className="ks-admin-title">
            {mode.type === "create" ? `Novo ${config.singular}` : "Editar"}
          </h1>
          <p className="ks-admin-lead">{config.help}</p>
        </header>
        <ItemForm
          config={config}
          initial={mode.type === "edit" ? mode.item : null}
          onCancel={() => setMode({ type: "list" })}
          onSaved={async () => {
            const wasCreate = mode.type === "create";
            setMode({ type: "list" });
            setLoading(true);
            await reload();
            setNotice(wasCreate ? "Trabalho adicionado." : "Alterações salvas.");
          }}
          save={saveItem}
        />
      </div>
    );
  }

  return (
    <div className="ks-admin-shell">
      <header className="ks-admin-brand ks-gallery-header">
        <div>
          <p className="ks-admin-kicker">Galeria</p>
          <h1 className="ks-admin-title">{config.label}</h1>
          <p className="ks-admin-lead">{config.help}</p>
          {beforeAfter && pendingCount > 0 ? (
            <p className="ks-gallery-pending-summary" role="status">
              {pendingCount === 1
                ? "1 caso aguardando foto do depois"
                : `${pendingCount} casos aguardando foto do depois`}
            </p>
          ) : null}
        </div>
        <button type="button" className="ks-admin-btn ks-gallery-add" onClick={() => setMode({ type: "create" })}>
          Adicionar {config.singular}
        </button>
      </header>

      {notice ? (
        <p className="ks-admin-toast" role="status">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="ks-admin-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? <p className="ks-admin-muted">Carregando…</p> : null}

      {!loading && items.length === 0 ? (
        <div className="ks-gallery-empty">
          <img src="/assets/brand/star-karina-outline.webp" alt="" className="ks-gallery-empty-star" />
          <p>{beforeAfter ? "Nenhum caso ainda — comece pela foto do antes." : "Nenhum item ainda — comece pela foto."}</p>
          <button type="button" className="ks-admin-btn" onClick={() => setMode({ type: "create" })}>
            Adicionar o primeiro
          </button>
        </div>
      ) : null}

      <ul className="ks-gallery-grid">
        {displayItems.map((item, index) => {
          const incomplete = beforeAfter && isIncompleteReformulation(item);
          return (
            <li
              key={item.id}
              className={`ks-gallery-tile${item.published ? "" : " is-hidden"}${item.featured ? " is-featured" : ""}${incomplete ? " is-pending" : ""}${leavingId === item.id ? " is-leave" : ""}`}
            >
              <button
                type="button"
                className="ks-gallery-tile-main"
                disabled={busyId === item.id}
                onClick={() => setMode({ type: "edit", item })}
              >
                {beforeAfter ? (
                  <span className="ks-gallery-tile-media ks-gallery-tile-media--pair">
                    <img
                      src={item.image_url}
                      alt={`Antes — ${item.alt_text || item.title}`}
                      width={200}
                      height={250}
                      loading="lazy"
                      decoding="async"
                      style={focalStyle(item.focal_x, item.focal_y)}
                    />
                    {item.after_image_url ? (
                      <img
                        src={item.after_image_url}
                        alt={`Depois — ${item.alt_text || item.title}`}
                        width={200}
                        height={250}
                        loading="lazy"
                        decoding="async"
                        style={focalStyle(item.after_focal_x, item.after_focal_y)}
                      />
                    ) : (
                      <span className="ks-gallery-tile-after-empty" aria-hidden="true">
                        Depois
                      </span>
                    )}
                    {incomplete ? (
                      <span className="ks-gallery-pending-badge">Aguardando foto do depois</span>
                    ) : null}
                    {item.featured ? (
                      <span className="ks-gallery-featured-badge">Destaque</span>
                    ) : null}
                  </span>
                ) : (
                  <span className="ks-gallery-tile-media">
                    <img
                      src={item.image_url}
                      alt={item.alt_text || item.title}
                      width={400}
                      height={500}
                      loading="lazy"
                      decoding="async"
                      style={focalStyle(item.focal_x, item.focal_y)}
                    />
                    {item.featured ? (
                      <span className="ks-gallery-featured-badge">Destaque</span>
                    ) : null}
                  </span>
                )}
                <span className="ks-gallery-tile-copy">
                  <span className="ks-gallery-tile-title">{item.title}</span>
                  {metaLine(item) ? <span className="ks-gallery-tile-meta">{metaLine(item)}</span> : null}
                </span>
              </button>

              <div className="ks-gallery-tile-toolbar">
                <div className="ks-gallery-order">
                  <button
                    type="button"
                    className="ks-gallery-icon-btn"
                    aria-label="Subir"
                    disabled={index === 0 || busyId === item.id}
                    onClick={() => void move(item.id, -1)}
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    type="button"
                    className="ks-gallery-icon-btn"
                    aria-label="Descer"
                    disabled={index === displayItems.length - 1 || busyId === item.id}
                    onClick={() => void move(item.id, 1)}
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
                {supportsFeatured ? (
                  <button
                    type="button"
                    className={`ks-gallery-icon-btn${item.featured ? " is-featured" : ""}`}
                    aria-label={item.featured ? "Remover destaque" : "Marcar como destaque"}
                    aria-pressed={item.featured}
                    disabled={busyId === item.id}
                    title={
                      !item.published && !item.featured
                        ? "Publique o item antes de destacá-lo"
                        : item.featured
                          ? "Remover destaque"
                          : "Projeto em destaque"
                    }
                    onClick={() => void toggleFeatured(item)}
                  >
                    <Star size={16} fill={item.featured ? "currentColor" : "none"} />
                  </button>
                ) : null}
                <button
                  type="button"
                  className="ks-gallery-edit-btn"
                  disabled={busyId === item.id}
                  onClick={() => setMode({ type: "edit", item })}
                >
                  <Pencil size={15} /> Editar
                </button>
                <button
                  type="button"
                  className="ks-gallery-icon-btn ks-gallery-icon-btn--danger"
                  aria-label={`Remover ${item.title}`}
                  disabled={busyId === item.id}
                  onClick={() => void remove(item)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {featuredSwap ? (
        <div
          className="ks-admin-dialog-backdrop"
          role="presentation"
          onClick={() => setFeaturedSwap(null)}
        >
          <div
            className="ks-admin-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ks-featured-swap-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="ks-featured-swap-title">Trocar destaque?</h2>
            <p>
              Já existe um destaque nesta coleção. Ao confirmar,{" "}
              <strong>{featuredSwap.candidate.title}</strong> passa a ser o destaque e o atual
              deixa de ser.
            </p>
            <div className="ks-admin-featured-dialog-thumb">
              <img
                src={featuredSwap.current.image_url}
                alt=""
                width={72}
                height={90}
                style={focalStyle(featuredSwap.current.focal_x, featuredSwap.current.focal_y)}
              />
              <div>
                <p className="ks-admin-muted" style={{ margin: 0, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Destaque atual
                </p>
                <p style={{ margin: "4px 0 0", fontWeight: 600 }}>{featuredSwap.current.title}</p>
              </div>
            </div>
            <div className="ks-admin-dialog-actions">
              <button
                type="button"
                className="ks-admin-btn ks-admin-btn--secondary"
                onClick={() => setFeaturedSwap(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="ks-admin-btn"
                disabled={busyId !== null}
                onClick={() => void confirmFeaturedSwap()}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
