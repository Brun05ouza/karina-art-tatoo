import { ImagePlus, Plus, Star, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { uploadImage } from "../data/mediaStore";
import type { PortfolioItem } from "../data/types";
import { useCollection } from "../hooks/useCollection";
import { useToast } from "../hooks/useToast";
import { portfolioStore } from "../data/stores";
import { AdminButton, Field, SelectField, TextArea, TextInput } from "./Primitives";

const categories = ["Fine Line", "Minimalista", "Blackwork", "Projetos Autorais", "Flash Tattoo", "Cicatrizadas"];
const bodyLocations = ["Braço", "Antebraço", "Costas", "Coxa", "Perna", "Costela", "Ombro", "Pescoço", "Mão", "Tornozelo"];
const styles = ["Fine Line", "Minimalista", "Blackwork", "Botânico", "Ornamental", "Autoral", "Geométrico", "Floral"];

const emptyDraft = {
  title: "",
  description: "",
  category: categories[0],
  bodyLocation: "",
  style: "",
  imageUrl: "",
  imageKey: "",
};

/**
 * Lista os trabalhos do portfólio na Home.
 * Cada card tem “Mostrar na home”; o botão de adicionar cria o trabalho aqui mesmo.
 */
export function PortfolioSelector() {
  const { items, loading, save, reload } = useCollection(portfolioStore);
  const { show } = useToast();
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setCreating(false);
    setDraft(emptyDraft);
  };

  const patchDraft = (changes: Partial<typeof emptyDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
  };

  const toggleFeatured = async (item: PortfolioItem) => {
    try {
      await save({ ...item, featured: !item.featured });
      show(item.featured ? "Removido da home." : "Agora aparece na home.");
    } catch (cause) {
      show(cause instanceof Error ? cause.message : "Não foi possível atualizar.", "error");
    }
  };

  const pickImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const image = await uploadImage(file, "portfolio/trabalhos");
      patchDraft({ imageUrl: image.imageUrl, imageKey: image.imageKey });
    } catch (cause) {
      show(cause instanceof Error ? cause.message : "Imagem inválida.", "error");
    } finally {
      setUploading(false);
    }
  };

  const createItem = async () => {
    const trimmed = draft.title.trim();
    if (!trimmed) {
      show("Informe um título para o trabalho.", "error");
      return;
    }
    if (!draft.imageUrl) {
      show("Adicione uma imagem do trabalho.", "error");
      return;
    }
    setSaving(true);
    try {
      await save({
        id: "",
        order: items.length + 1,
        active: true,
        title: trimmed,
        description: draft.description.trim(),
        category: draft.category || categories[0],
        status: "Publicado",
        bodyLocation: draft.bodyLocation,
        style: draft.style,
        featured: true,
        imageUrl: draft.imageUrl,
        imageKey: draft.imageKey,
      });
      resetForm();
      show("Trabalho adicionado e marcado para a home.");
      await reload();
    } catch (cause) {
      show(cause instanceof Error ? cause.message : "Não foi possível salvar.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="ksa-portfolio-selector">
        {[1, 2, 3].map((i) => (
          <div key={i} className="ksa-portfolio-selector-card is-skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="ksa-portfolio-home">
      <p className="ksa-block-list-note">
        Cadastre o trabalho aqui com imagem e detalhes. Depois use “Mostrar na home” para escolher o que aparece na página inicial.
        {" "}
        <Link to="/admin/portfolio">Abrir portfólio completo</Link>
      </p>

      {creating ? (
        <div className="ksa-portfolio-create-panel">
          <div className="ksa-portfolio-create-head">
            <strong>Novo trabalho</strong>
            <button type="button" className="ksa-icon-danger" aria-label="Cancelar" onClick={resetForm}>
              <X size={16} />
            </button>
          </div>

          <div className="ksa-portfolio-create-grid">
            <label className="ksa-portfolio-create-thumb">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif"
                disabled={uploading}
                onChange={(event) => void pickImage(event.target.files?.[0])}
              />
              {draft.imageUrl ? (
                <img src={draft.imageUrl} alt="" />
              ) : (
                <span>
                  <ImagePlus size={26} />
                  {uploading ? "Enviando…" : "Imagem do trabalho"}
                </span>
              )}
            </label>

            <div className="ksa-portfolio-create-fields">
              <Field label="Título">
                <TextInput value={draft.title} onChange={(event) => patchDraft({ title: event.target.value })} placeholder="Nome do trabalho" />
              </Field>
              <Field label="Descrição curta" className="is-full">
                <TextArea rows={2} value={draft.description} onChange={(event) => patchDraft({ description: event.target.value })} placeholder="Uma frase sobre o trabalho" />
              </Field>
              <Field label="Categoria">
                <SelectField value={draft.category} onChange={(event) => patchDraft({ category: event.target.value })}>
                  {categories.map((option) => <option key={option} value={option}>{option}</option>)}
                </SelectField>
              </Field>
              <Field label="Local do corpo">
                <SelectField value={draft.bodyLocation} onChange={(event) => patchDraft({ bodyLocation: event.target.value })}>
                  <option value="">Selecionar</option>
                  {bodyLocations.map((option) => <option key={option} value={option}>{option}</option>)}
                </SelectField>
              </Field>
              <Field label="Estilo">
                <SelectField value={draft.style} onChange={(event) => patchDraft({ style: event.target.value })}>
                  <option value="">Selecionar</option>
                  {styles.map((option) => <option key={option} value={option}>{option}</option>)}
                </SelectField>
              </Field>
              <div className="ksa-portfolio-create-actions">
                <AdminButton tone="ghost" onClick={resetForm}>Cancelar</AdminButton>
                <AdminButton onClick={() => void createItem()} disabled={saving || uploading}>
                  {saving ? "Salvando…" : "Salvar na home"}
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="ksa-portfolio-selector">
        {[...items]
          .sort((a, b) => a.order - b.order)
          .map((item) => (
            <article
              key={item.id}
              className={`ksa-portfolio-selector-card ${item.featured ? "is-selected" : ""}`}
            >
              <div className="ksa-portfolio-selector-thumb">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} />
                ) : (
                  <span className="ksa-portfolio-selector-placeholder">
                    <ImagePlus size={20} />
                  </span>
                )}
              </div>
              <div className="ksa-portfolio-selector-info">
                <strong>{item.title}</strong>
                <small>
                  {[item.category, item.bodyLocation, item.style].filter(Boolean).join(" · ") || "Sem detalhes"}
                </small>
              </div>
              <button
                type="button"
                className={`ksa-portfolio-featured-btn ${item.featured ? "is-on" : ""}`}
                onClick={() => void toggleFeatured(item)}
                aria-pressed={item.featured}
              >
                <Star size={13} fill={item.featured ? "currentColor" : "none"} />
                {item.featured ? "Na home" : "Mostrar na home"}
              </button>
            </article>
          ))}

        {!creating ? (
          <button
            type="button"
            className="ksa-portfolio-selector-card ksa-portfolio-selector-add"
            onClick={() => setCreating(true)}
          >
            <span className="ksa-portfolio-selector-add-icon"><Plus size={22} /></span>
            <span>Adicionar trabalho</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
