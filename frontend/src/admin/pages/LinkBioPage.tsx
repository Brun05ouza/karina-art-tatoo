import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { ImagePicker } from "../components/ImagePicker";
import {
  AdminButton,
  AdminPage,
  CollapsibleBlock,
  Field,
  InternalLinkInput,
  SelectField,
  TextArea,
  TextInput,
  Toggle,
} from "../components/Primitives";
import { ErrorState, LoadingState } from "../components/States";
import { linkBioStore } from "../data/stores";
import type { LinkBioDocument, LinkButton } from "../data/types";
import { useDirtyGuard } from "../hooks/useDirtyGuard";
import { useDocument } from "../hooks/useDocument";
import { useToast } from "../hooks/useToast";

const ICON_OPTIONS = [
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "TikTok", label: "TikTok" },
  { value: "YouTube", label: "YouTube" },
  { value: "Images", label: "Imagem / Portfólio" },
  { value: "Sparkles", label: "Estrela / Flash" },
  { value: "ShoppingBag", label: "Sacola / Produtos" },
  { value: "Link", label: "Link simples" },
];

const DEFAULT_WHATSAPP_PHONE = "5521990724477";
const DEFAULT_WHATSAPP_MESSAGE = "Olá, Karina Sarte! Vim pela bio do site e queria fazer um orçamento.";

function isWhatsappIcon(icon: string) {
  const normalized = icon.toLowerCase();
  return normalized.includes("whatsapp") || normalized.includes("message") || normalized.includes("zap");
}

function isDirectSocialIcon(icon: string) {
  const normalized = icon.toLowerCase();
  return normalized.includes("tiktok") || normalized.includes("youtube");
}

function parseWhatsappUrl(url: string) {
  const fallback = { phone: DEFAULT_WHATSAPP_PHONE, message: DEFAULT_WHATSAPP_MESSAGE };
  if (!url) return fallback;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "wa.me") {
      return {
        phone: parsed.pathname.replace(/\D/g, "") || fallback.phone,
        message: parsed.searchParams.get("text") || fallback.message,
      };
    }
    if (host === "api.whatsapp.com") {
      return {
        phone: parsed.searchParams.get("phone")?.replace(/\D/g, "") || fallback.phone,
        message: parsed.searchParams.get("text") || fallback.message,
      };
    }
  } catch {
    // Link manual antigo: o admin passa a montar o padrão correto.
  }

  return fallback;
}

function buildWhatsappUrl(phone: string, message: string) {
  const rawDigits = phone.replace(/\D/g, "");
  const digits = rawDigits.length <= 11 ? `55${rawDigits}` : rawDigits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message.trim() || DEFAULT_WHATSAPP_MESSAGE)}`;
}

function defaultUrlForIcon(icon: string) {
  if (isWhatsappIcon(icon)) return buildWhatsappUrl(DEFAULT_WHATSAPP_PHONE, DEFAULT_WHATSAPP_MESSAGE);
  if (icon === "TikTok") return "https://www.tiktok.com/@karinasarte";
  if (icon === "YouTube") return "https://www.youtube.com/@karinasarte";
  if (icon === "Images") return "/portfolio";
  if (icon === "Sparkles") return "/flash-tattoos";
  if (icon === "ShoppingBag") return "/produtos";
  return "/";
}

function displayPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 11 && digits.startsWith("55") ? digits.slice(2) : digits;
}

function maskBrazilPhone(phone: string) {
  const digits = displayPhone(phone).slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)})${digits.slice(2)}`;
  return `(${digits.slice(0, 2)})${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function LinkBioPage() {
  const { value, setValue, loading, error, reload, save } = useDocument(linkBioStore);
  const { dirty, setDirty } = useDirtyGuard();
  const { show } = useToast();

  useEffect(() => () => setDirty(false), [setDirty]);

  if (loading) return <AdminPage title="Link da bio"><LoadingState /></AdminPage>;
  if (error || !value) return <AdminPage title="Link da bio"><ErrorState message={error || "Conteúdo indisponível."} onRetry={reload} /></AdminPage>;

  const update = (patch: Partial<LinkBioDocument>) => {
    setValue({ ...value, ...patch });
    setDirty(true);
  };

  const updateButton = (id: string, patch: Partial<LinkButton>) => {
    update({ buttons: value.buttons.map((item) => item.id === id ? { ...item, ...patch } : item) });
  };

  const updateButtonIcon = (button: LinkButton, icon: string) => {
    updateButton(button.id, {
      icon,
      url: defaultUrlForIcon(icon),
    });
  };

  const updateWhatsappButton = (button: LinkButton, patch: Partial<{ phone: string; message: string }>) => {
    const current = parseWhatsappUrl(button.url);
    updateButton(button.id, {
      icon: "WhatsApp",
      url: buildWhatsappUrl(patch.phone ?? current.phone, patch.message ?? current.message),
    });
  };

  const moveButton = (id: string, direction: -1 | 1) => {
    const buttons = [...value.buttons].sort((a, b) => a.order - b.order);
    const index = buttons.findIndex((item) => item.id === id);
    const target = index + direction;
    if (target < 0 || target >= buttons.length) return;
    [buttons[index], buttons[target]] = [buttons[target]!, buttons[index]!];
    update({ buttons: buttons.map((item, position) => ({ ...item, order: position + 1 })) });
  };

  const addButton = () => {
    update({
      buttons: [
        ...value.buttons,
        { id: crypto.randomUUID(), label: "Novo botão", url: "/", icon: "Link", active: true, order: value.buttons.length + 1 },
      ],
    });
  };

  const submit = async () => {
    try {
      await save(value);
      setDirty(false);
      show("Link da bio salvo.");
    } catch (cause) {
      show(cause instanceof Error ? cause.message : "Não foi possível salvar.", "error");
    }
  };

  const buttons = [...value.buttons].sort((a, b) => a.order - b.order);

  return (
    <AdminPage
      eyebrow="Página compacta"
      title="Link da bio"
      description="Edite a versão mobile da bio em /bio."
    >
      <div className="ksa-document-editor">
          <CollapsibleBlock title="Visual e perfil" summary="Fundo, foto e textos principais" defaultOpen>
            <div className="ksa-grid-2">
              <div className="is-full">
                <ImagePicker label="Imagem de fundo" folder="link-bio/background" value={value.backgroundUrl} onChange={(url) => update({ backgroundUrl: url })} />
              </div>
              <div className="is-full">
                <ImagePicker label="Foto de perfil" folder="link-bio/avatar" value={value.avatarUrl} onChange={(url) => update({ avatarUrl: url })} />
              </div>
              <Field label="Texto superior"><TextInput value={value.eyebrow} onChange={(event) => update({ eyebrow: event.target.value })} /></Field>
              <Field label="Nome"><TextInput value={value.name} onChange={(event) => update({ name: event.target.value })} /></Field>
              <Field label="Bio" className="is-full"><TextArea rows={3} value={value.bio} onChange={(event) => update({ bio: event.target.value })} /></Field>
            </div>
          </CollapsibleBlock>

          <CollapsibleBlock title="Botões principais" summary="Adicione, remova e organize os botões" defaultOpen>
            <div className="ksa-stack is-link-bio-list">
              {buttons.map((button, index) => {
                const isWhatsapp = isWhatsappIcon(button.icon);
                const isDirectSocial = isDirectSocialIcon(button.icon);
                const whatsapp = parseWhatsappUrl(button.url);

                return (
                  <article className={`ksa-mini-editor is-link-bio-item${isWhatsapp ? " is-whatsapp" : ""}`} key={button.id}>
                    <div className="ksa-mini-editor-order">
                      <button type="button" disabled={index === 0} onClick={() => moveButton(button.id, -1)} aria-label="Mover para cima"><ArrowUp size={15} /></button>
                      <button type="button" disabled={index === buttons.length - 1} onClick={() => moveButton(button.id, 1)} aria-label="Mover para baixo"><ArrowDown size={15} /></button>
                    </div>

                    <div className="ksa-link-bio-item-main">
                      <Field label="Texto do botão"><TextInput value={button.label} onChange={(event) => updateButton(button.id, { label: event.target.value })} /></Field>
                      <Field label="Tipo">
                        <SelectField value={button.icon} onChange={(event) => updateButtonIcon(button, event.target.value)}>
                          {ICON_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </SelectField>
                      </Field>

                      {isWhatsapp ? (
                        <>
                          <Field label="Número do WhatsApp">
                            <TextInput
                              inputMode="tel"
                              placeholder="(21)99072-4477"
                              value={maskBrazilPhone(whatsapp.phone)}
                              onChange={(event) => updateWhatsappButton(button, { phone: event.target.value })}
                            />
                          </Field>
                          <Field label="Mensagem automática" className="is-full">
                            <TextArea rows={3} value={whatsapp.message} onChange={(event) => updateWhatsappButton(button, { message: event.target.value })} />
                          </Field>
                        </>
                      ) : isDirectSocial ? (
                        <Field label={`Link do ${button.icon}`} className="is-full">
                          <TextInput
                            inputMode="url"
                            placeholder={button.icon === "TikTok" ? "https://www.tiktok.com/@karinasarte" : "https://www.youtube.com/@karinasarte"}
                            value={button.url}
                            onChange={(event) => updateButton(button.id, { url: event.target.value })}
                          />
                        </Field>
                      ) : (
                        <Field label="Link" className="is-full"><InternalLinkInput value={button.url} onChange={(url) => updateButton(button.id, { url })} /></Field>
                      )}
                    </div>

                    <Toggle checked={button.active} onChange={(active) => updateButton(button.id, { active })} label={button.active ? "Ativo" : "Inativo"} />
                    <button type="button" className="ksa-icon-danger" aria-label="Excluir botão" onClick={() => update({ buttons: value.buttons.filter((item) => item.id !== button.id) })}><Trash2 size={16} /></button>
                  </article>
                );
              })}
              <AdminButton tone="ghost" className="ksa-repeater-add" onClick={addButton}><Plus size={16} />Adicionar botão</AdminButton>
            </div>
          </CollapsibleBlock>

          <CollapsibleBlock title="Link final" summary="Botão para abrir o site completo">
            <div className="ksa-grid-2 ksa-link-bio-footer-fields">
              <Field label="Texto do link"><TextInput value={value.footerLabel} onChange={(event) => update({ footerLabel: event.target.value })} /></Field>
              <Field label="Para onde leva"><InternalLinkInput value={value.footerUrl} onChange={(footerUrl) => update({ footerUrl })} /></Field>
            </div>
          </CollapsibleBlock>

          <div className={`ksa-save-bar ksa-document-save ${dirty ? "is-dirty" : ""}`}>
            <span><i />{dirty ? "Alterações não salvas" : "Tudo salvo"}</span>
            <AdminButton onClick={() => void submit()} disabled={!dirty}><Save size={17} />Salvar alterações</AdminButton>
          </div>
      </div>
    </AdminPage>
  );
}
