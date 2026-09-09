import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ApiError,
  createGalleryItem,
  deleteGalleryItem,
  listGallery,
  patchGalleryItem,
  reorderGallery,
  type GalleryItem,
} from "../auth/api";
import { COLLECTIONS, type GalleryCollectionId } from "./collections";
import { ItemForm, type ItemFormValues } from "./ItemForm";

type Mode = { type: "list" } | { type: "create" } | { type: "edit"; item: GalleryItem };

export function GalleryPage({ collectionId }: { collectionId: GalleryCollectionId }) {
  const config = COLLECTIONS[collectionId];
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ type: "list" });
  const [busyId, setBusyId] = useState<string | null>(null);

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
    void reload();
  }, [reload]);

  async function saveItem(payload: {
    values: ItemFormValues;
    image?: { imageUrl: string; imageKey: string };
  }) {
    const v = payload.values;
    const base: Record<string, unknown> = {
      title: v.title.trim(),
      alt_text: v.alt_text.trim() || null,
      published: v.published,
    };
    if (config.fields.includes("category")) base.category = v.category.trim() || null;
    if (config.fields.includes("price")) base.price = v.price.trim() || null;
    if (config.fields.includes("link")) base.link = v.link.trim() || null;
    if (config.fields.includes("status")) base.status = v.status;

    if (mode.type === "edit") {
      if (payload.image) {
        base.image_url = payload.image.imageUrl;
        base.image_key = payload.image.imageKey;
      }
      await patchGalleryItem(mode.item.id, base);
    } else {
      if (!payload.image) throw new Error("Escolha uma foto.");
      base.image_url = payload.image.imageUrl;
      base.image_key = payload.image.imageKey;
      await createGalleryItem(collectionId, base);
    }
  }

  async function move(id: string, dir: -1 | 1) {
    const index = items.findIndex((i) => i.id === id);
    const next = index + dir;
    if (index < 0 || next < 0 || next >= items.length) return;
    const ids = items.map((i) => i.id);
    const tmp = ids[index]!;
    ids[index] = ids[next]!;
    ids[next] = tmp;
    setBusyId(id);
    setError(null);
    try {
      await reorderGallery(collectionId, ids);
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível reordenar.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: GalleryItem) {
    const ok = window.confirm(`Remover “${item.title}”? Essa ação não dá para desfazer.`);
    if (!ok) return;
    setBusyId(item.id);
    setError(null);
    try {
      await deleteGalleryItem(item.id);
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível remover.");
    } finally {
      setBusyId(null);
    }
  }

  if (mode.type === "create" || mode.type === "edit") {
    return (
      <div className="ks-admin-shell">
        <header className="ks-admin-brand">
          <p className="ks-admin-kicker">
            <Link to={config.path} className="ks-admin-back" onClick={(e) => {
              e.preventDefault();
              setMode({ type: "list" });
            }}>
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
            setMode({ type: "list" });
            setLoading(true);
            await reload();
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
        </div>
        <button type="button" className="ks-admin-btn ks-gallery-add" onClick={() => setMode({ type: "create" })}>
          Adicionar {config.singular}
        </button>
      </header>

      {error ? (
        <p className="ks-admin-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? <p className="ks-admin-muted">Carregando…</p> : null}

      {!loading && items.length === 0 ? (
        <div className="ks-gallery-empty">
          <p>Nenhum item ainda.</p>
          <button type="button" className="ks-admin-btn" onClick={() => setMode({ type: "create" })}>
            Adicionar o primeiro
          </button>
        </div>
      ) : null}

      <ul className="ks-gallery-list">
        {items.map((item, index) => (
          <li key={item.id} className={`ks-gallery-card${!item.published ? " is-hidden" : ""}`}>
            <img
              src={item.image_url}
              alt={item.alt_text || item.title}
              width={400}
              height={400}
              loading="lazy"
              decoding="async"
            />
            <div className="ks-gallery-card-body">
              <p className="ks-gallery-card-title">{item.title}</p>
              <p className="ks-gallery-card-meta">
                {!item.published ? "Oculto · " : ""}
                {item.category || item.price || (item.status === "vendido" ? "Vendido" : item.status === "disponivel" ? "Disponível" : "")}
              </p>
              <div className="ks-gallery-card-actions">
                <button
                  type="button"
                  className="ks-admin-ghost-btn"
                  disabled={index === 0 || busyId === item.id}
                  onClick={() => void move(item.id, -1)}
                >
                  Subir
                </button>
                <button
                  type="button"
                  className="ks-admin-ghost-btn"
                  disabled={index === items.length - 1 || busyId === item.id}
                  onClick={() => void move(item.id, 1)}
                >
                  Descer
                </button>
                <button
                  type="button"
                  className="ks-admin-ghost-btn"
                  disabled={busyId === item.id}
                  onClick={() => setMode({ type: "edit", item })}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="ks-admin-ghost-btn"
                  disabled={busyId === item.id}
                  onClick={() => void remove(item)}
                >
                  Remover
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
