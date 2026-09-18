import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Eye, Pencil, Trash2 } from "lucide-react";
import { bioActionIcon } from "../../app/components/BioLinkAction";
import { LinkBioView } from "../../app/components/LinkBioView";
import { defaultLinkBioContent, type LinkBioButton, type LinkBioContent } from "../../app/link-bio-content";
import { whatsappHref } from "../../app/site-settings";
import {
  ApiError,
  createBioChip,
  createBioLink,
  createBioTestimonial,
  deleteBioChip,
  deleteBioLink,
  deleteBioTestimonial,
  getAdminSettings,
  getBioProfile,
  listBioLinks,
  patchAdminSettings,
  patchBioChip,
  patchBioLink,
  patchBioProfile,
  patchBioTestimonial,
  reorderBioChips,
  reorderBioLinks,
  reorderBioTestimonials,
  type BioIconId,
  type BioKindId,
  type BioLinkItem,
  type BioProfile,
  type BioStyleChip,
  type BioTestimonial,
} from "../auth/api";
import { prepareImage, uploadPreparedImage, type UploadStage } from "../gallery/upload";
import { FocalPreview } from "../gallery/FocalPreview";
import { DEFAULT_FOCAL, type FocalPoint } from "../../app/focal";
import "../../styles/bio-refined.css";
import "../bio-preview.css";

const ICONS: { id: BioIconId; label: string }[] = [
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "portfolio", label: "Portfólio" },
  { id: "produtos", label: "Produtos" },
  { id: "link", label: "Link" },
];

const KINDS: { id: BioKindId; label: string; hint: string }[] = [
  { id: "whatsapp", label: "WhatsApp", hint: "Só a mensagem — o link usa o número do site" },
  { id: "external", label: "Abre fora", hint: "URL completa (http/https)" },
  { id: "internal", label: "Página do site", hint: "Escolha a rota do site" },
];

/** Espelho de INTERNAL_PATHS em functions/_lib/bio-links.ts */
const SITE_ROUTES: { path: string; label: string }[] = [
  { path: "/", label: "Início" },
  { path: "/sobre", label: "Sobre" },
  { path: "/portfolio", label: "Portfólio" },
  { path: "/reformulacoes", label: "Reformulações" },
  { path: "/releituras", label: "Releituras" },
  { path: "/flash-tattoos", label: "Flash tattoos" },
  { path: "/produtos", label: "Produtos" },
  { path: "/orcamento", label: "Orçamento" },
  { path: "/bio", label: "Link da bio" },
];

type BioTab = "perfil" | "links" | "estilos" | "depoimentos" | "estudio";

const TABS: { id: BioTab; label: string }[] = [
  { id: "perfil", label: "Perfil" },
  { id: "links", label: "Links" },
  { id: "estilos", label: "Estilos" },
  { id: "depoimentos", label: "Depoimentos" },
  { id: "estudio", label: "Estúdio" },
];

function isSiteRoute(path: string): boolean {
  return SITE_ROUTES.some((r) => r.path === path);
}

type Mode = { type: "list" } | { type: "create" } | { type: "edit"; item: BioLinkItem };

type FormState = {
  label: string;
  kind: BioKindId;
  url: string;
  message: string;
  icon: BioIconId;
  featured: boolean;
  published: boolean;
};

type PhoneStatus = "idle" | "saving" | "saved";

const emptyForm = (): FormState => ({
  label: "",
  kind: "external",
  url: "",
  message: "",
  icon: "link",
  featured: false,
  published: true,
});

function normalizeBrandLabel(label: string): string {
  const t = label.trim();
  if (/^youtube$/i.test(t)) return "YouTube";
  if (/^tiktok$/i.test(t)) return "TikTok";
  if (/^instagram$/i.test(t)) return "Instagram";
  return label;
}

function fromItem(item: BioLinkItem): FormState {
  return {
    label: normalizeBrandLabel(item.label),
    kind: item.kind || "external",
    url: item.url || "",
    message: item.message || "",
    icon: item.icon ?? (item.kind === "whatsapp" ? "whatsapp" : "link"),
    featured: item.featured,
    published: item.published,
  };
}

function itemIcon(item: BioLinkItem): string {
  return item.icon || (item.kind === "whatsapp" ? "whatsapp" : "link");
}

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** DDD + número a partir do E.164 BR (55…). */
function nationalDigits(full: string): string {
  const d = digitsOnly(full);
  return d.startsWith("55") ? d.slice(2) : d;
}

function formatNational(digits: string): string {
  const d = digitsOnly(digits).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function destinationOf(item: BioLinkItem): { text: string; title: string; broken: boolean } {
  if (item.kind === "whatsapp") {
    const msg = item.message?.trim();
    if (!msg) {
      return { text: "Sem mensagem inicial", title: "WhatsApp sem mensagem inicial", broken: false };
    }
    const quoted = `"${msg}"`;
    return { text: quoted, title: quoted, broken: false };
  }

  if (item.kind === "internal") {
    const url = item.url?.trim() || "";
    if (!url) return { text: "Caminho ausente", title: "Sem destino", broken: true };
    return { text: url, title: url, broken: false };
  }

  const url = item.url?.trim() || "";
  if (!url) return { text: "URL ausente", title: "Sem destino", broken: true };
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return { text: "URL inválida", title: url, broken: true };
    }
    const host = u.hostname.replace(/^www\./i, "");
    const path = u.pathname === "/" ? "" : u.pathname;
    const display = `${host}${path}${u.search}`;
    return { text: display || host, title: url, broken: false };
  } catch {
    return { text: "URL inválida", title: url, broken: true };
  }
}

function kindChipLabel(kind: BioKindId): string {
  if (kind === "whatsapp") return "WhatsApp";
  if (kind === "internal") return "página do site";
  return "abre fora";
}

function resolvePreviewUrl(
  kind: BioKindId,
  url: string,
  message: string | null | undefined,
  phone: string,
): string {
  if (kind === "whatsapp") return whatsappHref(message || undefined, phone);
  return url.trim() || "#";
}

function buildPreviewButtons(
  items: BioLinkItem[],
  editId: string | undefined,
  draft: FormState | null | undefined,
  phone: string,
): LinkBioButton[] {
  const out: LinkBioButton[] = [];

  for (const [index, item] of items.entries()) {
    if (editId && item.id === editId) {
      if (draft?.published) {
        out.push({
          id: item.id,
          kind: draft.kind,
          label: normalizeBrandLabel(draft.label.trim() || "Rótulo do botão"),
          url: resolvePreviewUrl(draft.kind, draft.url, draft.message, phone),
          icon: draft.kind === "whatsapp" ? "whatsapp" : draft.icon,
          active: true,
          order: index,
          featured: draft.featured,
        });
      }
      continue;
    }
    if (!item.published) continue;
    out.push({
      id: item.id,
      kind: item.kind,
      label: normalizeBrandLabel(item.label),
      url: resolvePreviewUrl(item.kind, item.url, item.message, phone),
      icon: itemIcon(item),
      active: true,
      // Ordem da lista do painel (array) — não o sort_order antigo em memória.
      order: index,
      featured: item.featured,
    });
  }

  if (draft && !editId && draft.published) {
    out.push({
      id: "draft",
      kind: draft.kind,
      label: normalizeBrandLabel(draft.label.trim() || "Rótulo do botão"),
      url: resolvePreviewUrl(draft.kind, draft.url, draft.message, phone),
      icon: draft.kind === "whatsapp" ? "whatsapp" : draft.icon,
      active: true,
      order: items.length,
      featured: draft.featured,
    });
  }

  return out;
}

function BioLivePreview({
  items,
  editId,
  draft,
  profile,
  chips,
  testimonials,
  phone,
}: {
  items: BioLinkItem[];
  editId?: string;
  draft?: FormState | null;
  profile: BioProfile | null;
  chips: BioStyleChip[];
  testimonials: BioTestimonial[];
  phone: string;
}) {
  const content = useMemo((): LinkBioContent => {
    const buttons = buildPreviewButtons(items, editId, draft, phone);
    const showFooter = Boolean(profile?.show_site_footer);
    return {
      ...defaultLinkBioContent,
      bio: profile?.subtitle?.trim() || defaultLinkBioContent.bio,
      avatarUrl: profile?.avatar_url || defaultLinkBioContent.avatarUrl,
      avatarFocalX: profile?.avatar_focal_x ?? 50,
      avatarFocalY: profile?.avatar_focal_y ?? 50,
      studioImageUrl: profile?.studio_image_url || defaultLinkBioContent.studioImageUrl,
      studioFocalX: profile?.studio_focal_x ?? 50,
      studioFocalY: profile?.studio_focal_y ?? 50,
      backgroundUrl: profile?.cover_image_url || "",
      backgroundFocalX: profile?.cover_focal_x ?? 50,
      backgroundFocalY: profile?.cover_focal_y ?? 50,
      footerLabel: showFooter ? "Site completo" : "",
      footerUrl: showFooter ? "/" : "",
      buttons,
      styleChips: chips.map((chip, index) => ({
        id: chip.id,
        label: chip.label,
        active: true,
        order: index,
      })),
      testimonials: testimonials
        .filter((t) => t.published && t.quote.trim())
        .map((t, index) => ({
          id: t.id,
          text: t.quote,
          active: true,
          order: index,
        })),
    };
  }, [items, editId, draft, profile, chips, testimonials, phone]);

  const now = new Date();
  const clock = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="ks-bio-device-wrap" aria-label="Simulação da bio em celular">
      <p className="ks-bio-device-caption">Prévia · iPhone · /bio</p>

      <div className="ks-bio-device">
        <div className="ks-bio-device-bezel" aria-hidden="true">
          <span className="ks-bio-device-island" />
        </div>

        <div className="ks-bio-device-screen">
          <div className="ks-bio-device-status" aria-hidden="true">
            <span>{clock}</span>
            <span className="ks-bio-device-status-icons">
              <span className="ks-bio-device-signal" />
              <span className="ks-bio-device-wifi" />
              <span className="ks-bio-device-battery" />
            </span>
          </div>

          <div className="ks-bio-device-scroll">
            <LinkBioView
              content={{ ...content, loaded: true }}
              phone={phone || "5521990724477"}
              preview
              reduceMotion
              showFlashSection={false}
              className="ks-bio-device-live"
            />
          </div>

          <div className="ks-bio-device-home" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export function BioLinksPage() {
  const [items, setItems] = useState<BioLinkItem[]>([]);
  const [profile, setProfile] = useState<BioProfile | null>(null);
  const [chips, setChips] = useState<BioStyleChip[]>([]);
  const [testimonials, setTestimonials] = useState<BioTestimonial[]>([]);
  const [tab, setTab] = useState<BioTab>("links");
  const [phone, setPhone] = useState("");
  const [phoneNational, setPhoneNational] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>({ type: "list" });
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<{
    label?: string;
    url?: string;
    message?: string;
    phone?: string;
    form?: string;
  }>({});
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [phoneBusy, setPhoneBusy] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState<PhoneStatus>("idle");
  const [showPreview, setShowPreview] = useState(false);
  const [routeMenuOpen, setRouteMenuOpen] = useState(false);
  const [footerBusy, setFooterBusy] = useState(false);
  const routeSelectRef = useRef<HTMLDivElement>(null);

  const [subtitleDraft, setSubtitleDraft] = useState("");
  const [subtitleBusy, setSubtitleBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarStage, setAvatarStage] = useState<UploadStage>("idle");
  const [studioBusy, setStudioBusy] = useState(false);
  const [studioStage, setStudioStage] = useState<UploadStage>("idle");
  const [coverBusy, setCoverBusy] = useState(false);
  const [coverStage, setCoverStage] = useState<UploadStage>("idle");
  const [avatarFocal, setAvatarFocal] = useState<FocalPoint>({ ...DEFAULT_FOCAL });
  const [studioFocal, setStudioFocal] = useState<FocalPoint>({ ...DEFAULT_FOCAL });
  const [coverFocal, setCoverFocal] = useState<FocalPoint>({ ...DEFAULT_FOCAL });
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const studioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [chipLabel, setChipLabel] = useState("");
  const [chipBusy, setChipBusy] = useState(false);
  const [editingChipId, setEditingChipId] = useState<string | null>(null);
  const [editingChipLabel, setEditingChipLabel] = useState("");

  const [testimonialForm, setTestimonialForm] = useState({
    quote: "",
    author: "",
    published: true,
  });
  const [testimonialBusy, setTestimonialBusy] = useState(false);

  const selectedRoute =
    SITE_ROUTES.find((r) => r.path === form.url) ?? SITE_ROUTES.find((r) => r.path === "/portfolio")!;

  const phoneDirty =
    digitsOnly(`55${digitsOnly(phoneNational)}`) !== digitsOnly(phone) &&
    digitsOnly(phoneNational).length > 0;

  const reload = useCallback(async () => {
    setError(null);
    try {
      const [links, settings, bio] = await Promise.all([
        listBioLinks(),
        getAdminSettings(),
        getBioProfile(),
      ]);
      setItems(links.items);
      setPhone(settings.whatsappPhone);
      setPhoneNational(formatNational(nationalDigits(settings.whatsappPhone)));
      setPhoneStatus("idle");
      setProfile(bio.profile);
      setChips(bio.chips);
      setTestimonials(bio.testimonials);
      setSubtitleDraft(bio.profile.subtitle || "");
      setAvatarFocal({
        x: bio.profile.avatar_focal_x ?? 50,
        y: bio.profile.avatar_focal_y ?? 50,
      });
      setStudioFocal({
        x: bio.profile.studio_focal_x ?? 50,
        y: bio.profile.studio_focal_y ?? 50,
      });
      setCoverFocal({
        x: bio.profile.cover_focal_x ?? 50,
        y: bio.profile.cover_focal_y ?? 50,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 2800);
    return () => window.clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    if (phoneStatus !== "saved") return;
    const t = window.setTimeout(() => setPhoneStatus("idle"), 2200);
    return () => window.clearTimeout(t);
  }, [phoneStatus]);

  useEffect(() => {
    if (form.kind !== "internal") setRouteMenuOpen(false);
  }, [form.kind]);

  useEffect(() => {
    if (!routeMenuOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (!routeSelectRef.current?.contains(e.target as Node)) setRouteMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setRouteMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [routeMenuOpen]);

  function openCreate() {
    setForm(emptyForm());
    setFieldErrors({});
    setMode({ type: "create" });
  }

  function openEdit(item: BioLinkItem) {
    setForm(fromItem(item));
    setFieldErrors({});
    setMode({ type: "edit", item });
  }

  async function savePhone() {
    if (phoneBusy || mode.type !== "list") return;
    const national = digitsOnly(phoneNational);
    if (!national) {
      setFieldErrors((e) => ({ ...e, phone: "Informe DDD e número." }));
      return;
    }
    const full = `55${national}`;
    if (full === digitsOnly(phone)) {
      setPhoneStatus("idle");
      return;
    }

    setPhoneBusy(true);
    setPhoneStatus("saving");
    setFieldErrors((e) => ({ ...e, phone: undefined }));
    try {
      const res = await patchAdminSettings({ whatsappPhone: full });
      setPhone(res.whatsappPhone);
      setPhoneNational(formatNational(nationalDigits(res.whatsappPhone)));
      setPhoneStatus("saved");
    } catch (err) {
      setPhoneStatus("idle");
      setFieldErrors((e) => ({
        ...e,
        phone: err instanceof ApiError ? err.message : "Não foi possível salvar o número.",
      }));
    } finally {
      setPhoneBusy(false);
    }
  }

  async function toggleSiteFooter(next: boolean) {
    if (footerBusy) return;
    setFooterBusy(true);
    setError(null);
    try {
      const res = await patchBioProfile({ show_site_footer: next });
      setProfile(res.profile);
      setNotice(next ? "Link “Site completo” ativado." : "Link “Site completo” oculto.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível atualizar.");
    } finally {
      setFooterBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const nextErrors: { label?: string; url?: string } = {};
    if (!form.label.trim()) nextErrors.label = "Escreva o rótulo.";
    if (form.kind !== "whatsapp" && !form.url.trim()) {
      nextErrors.url = form.kind === "internal" ? "Informe o caminho." : "Informe a URL.";
    }
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    setBusy(true);
    setFieldErrors({});
    try {
      const body: Record<string, unknown> = {
        label: normalizeBrandLabel(form.label.trim()),
        kind: form.kind,
        featured: form.featured,
        published: form.published,
        icon: form.kind === "whatsapp" ? "whatsapp" : form.icon,
      };
      if (form.kind === "whatsapp") {
        body.message = form.message.trim() || null;
        body.url = "";
      } else {
        body.url = form.url.trim();
        body.message = null;
      }

      if (mode.type === "edit") {
        await patchBioLink(mode.item.id, body);
        setNotice("Link atualizado.");
      } else {
        await createBioLink(body);
        setNotice("Link adicionado.");
      }
      setMode({ type: "list" });
      setTab("links");
      setLoading(true);
      await reload();
    } catch (err) {
      setFieldErrors({
        form: err instanceof ApiError ? err.message : "Não foi possível salvar.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function move(id: string, dir: -1 | 1, e?: MouseEvent) {
    e?.stopPropagation();
    const index = items.findIndex((i) => i.id === id);
    const next = index + dir;
    if (index < 0 || next < 0 || next >= items.length) return;
    const ids = items.map((i) => i.id);
    const tmp = ids[index]!;
    ids[index] = ids[next]!;
    ids[next] = tmp;
    setBusyId(id);
    setError(null);
    setItems(
      ids.map((xid, i) => {
        const row = items.find((item) => item.id === xid)!;
        return { ...row, sort_order: i };
      }),
    );
    try {
      await reorderBioLinks(ids);
      setNotice("Ordem atualizada.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível reordenar.");
      await reload();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: BioLinkItem, e?: MouseEvent) {
    e?.stopPropagation();
    const ok = window.confirm(`Remover “${normalizeBrandLabel(item.label)}”? Essa ação não dá para desfazer.`);
    if (!ok) return;
    setBusyId(item.id);
    setError(null);
    try {
      await deleteBioLink(item.id);
      await reload();
      setNotice(`“${normalizeBrandLabel(item.label)}” removido.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível remover.");
    } finally {
      setBusyId(null);
    }
  }

  async function saveSubtitle() {
    if (subtitleBusy) return;
    const value = subtitleDraft.trim();
    if (!value) {
      setError("Informe o subtítulo.");
      return;
    }
    if (value === (profile?.subtitle || "")) return;
    setSubtitleBusy(true);
    setError(null);
    try {
      const res = await patchBioProfile({ subtitle: value });
      setProfile(res.profile);
      setSubtitleDraft(res.profile.subtitle);
      setNotice("Subtítulo salvo.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar o subtítulo.");
    } finally {
      setSubtitleBusy(false);
    }
  }

  async function onAvatarFile(file: File | null) {
    if (!file || avatarBusy) return;
    setAvatarBusy(true);
    setError(null);
    try {
      const prepared = await prepareImage(file, (s) => setAvatarStage(s));
      const uploaded = await uploadPreparedImage(prepared, "bio-avatar", (s) => setAvatarStage(s));
      URL.revokeObjectURL(prepared.previewUrl);
      const res = await patchBioProfile({
        avatar_url: uploaded.imageUrl,
        avatar_key: uploaded.imageKey,
      });
      setProfile(res.profile);
      setAvatarFocal({ ...DEFAULT_FOCAL });
      setNotice("Avatar atualizado.");
      setAvatarStage("done");
    } catch (err) {
      setAvatarStage("error");
      setError(err instanceof ApiError || err instanceof Error ? err.message : "Falha no upload do avatar.");
    } finally {
      setAvatarBusy(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  async function onStudioFile(file: File | null) {
    if (!file || studioBusy) return;
    setStudioBusy(true);
    setError(null);
    try {
      const prepared = await prepareImage(file, (s) => setStudioStage(s));
      const uploaded = await uploadPreparedImage(prepared, "bio-studio", (s) => setStudioStage(s));
      URL.revokeObjectURL(prepared.previewUrl);
      const res = await patchBioProfile({
        studio_image_url: uploaded.imageUrl,
        studio_image_key: uploaded.imageKey,
      });
      setProfile(res.profile);
      setStudioFocal({ ...DEFAULT_FOCAL });
      setNotice("Foto do estúdio atualizada.");
      setStudioStage("done");
    } catch (err) {
      setStudioStage("error");
      setError(err instanceof ApiError || err instanceof Error ? err.message : "Falha no upload do estúdio.");
    } finally {
      setStudioBusy(false);
      if (studioInputRef.current) studioInputRef.current.value = "";
    }
  }

  async function onCoverFile(file: File | null) {
    if (!file || coverBusy) return;
    setCoverBusy(true);
    setError(null);
    try {
      const prepared = await prepareImage(file, (s) => setCoverStage(s));
      const uploaded = await uploadPreparedImage(prepared, "bio-cover", (s) => setCoverStage(s));
      URL.revokeObjectURL(prepared.previewUrl);
      const res = await patchBioProfile({
        cover_image_url: uploaded.imageUrl,
        cover_image_key: uploaded.imageKey,
      });
      setProfile(res.profile);
      setCoverFocal({ ...DEFAULT_FOCAL });
      setNotice("Capa da bio atualizada.");
      setCoverStage("done");
    } catch (err) {
      setCoverStage("error");
      setError(err instanceof ApiError || err instanceof Error ? err.message : "Falha no upload da capa.");
    } finally {
      setCoverBusy(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  async function clearCover() {
    if (coverBusy || !profile?.cover_image_url) return;
    setCoverBusy(true);
    setError(null);
    try {
      const res = await patchBioProfile({
        cover_image_url: "",
        cover_image_key: null,
      });
      setProfile(res.profile);
      setCoverFocal({ ...DEFAULT_FOCAL });
      setNotice("Capa voltou ao padrão.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível restaurar a capa.");
    } finally {
      setCoverBusy(false);
    }
  }

  async function commitAvatarFocal(next: FocalPoint) {
    if (!profile?.avatar_url) return;
    try {
      const res = await patchBioProfile({
        avatarFocalX: next.x,
        avatarFocalY: next.y,
      });
      setProfile(res.profile);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar o enquadramento do avatar.");
    }
  }

  async function commitStudioFocal(next: FocalPoint) {
    if (!profile?.studio_image_url) return;
    try {
      const res = await patchBioProfile({
        studioFocalX: next.x,
        studioFocalY: next.y,
      });
      setProfile(res.profile);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar o enquadramento do estúdio.");
    }
  }

  async function commitCoverFocal(next: FocalPoint) {
    if (!profile?.cover_image_url) return;
    try {
      const res = await patchBioProfile({
        coverFocalX: next.x,
        coverFocalY: next.y,
      });
      setProfile(res.profile);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar o enquadramento da capa.");
    }
  }

  async function addChip(e: FormEvent) {
    e.preventDefault();
    if (chipBusy) return;
    const label = chipLabel.trim();
    if (!label) return;
    setChipBusy(true);
    setError(null);
    try {
      await createBioChip({ label });
      setChipLabel("");
      await reload();
      setNotice("Estilo adicionado.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível adicionar o estilo.");
    } finally {
      setChipBusy(false);
    }
  }

  async function moveChip(id: string, dir: -1 | 1) {
    const index = chips.findIndex((c) => c.id === id);
    const next = index + dir;
    if (index < 0 || next < 0 || next >= chips.length) return;
    const ids = chips.map((c) => c.id);
    const tmp = ids[index]!;
    ids[index] = ids[next]!;
    ids[next] = tmp;
    setBusyId(id);
    setChips(
      ids.map((xid, i) => {
        const row = chips.find((c) => c.id === xid)!;
        return { ...row, sort_order: i };
      }),
    );
    try {
      await reorderBioChips(ids);
      setNotice("Ordem dos estilos atualizada.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível reordenar.");
      await reload();
    } finally {
      setBusyId(null);
    }
  }

  async function saveChipLabel(id: string) {
    const label = editingChipLabel.trim();
    const current = chips.find((c) => c.id === id);
    setEditingChipId(null);
    if (!label || !current || label === current.label) return;
    setBusyId(id);
    try {
      await patchBioChip(id, { label });
      await reload();
      setNotice("Estilo atualizado.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar o estilo.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeChip(chip: BioStyleChip) {
    const ok = window.confirm(`Remover o estilo “${chip.label}”?`);
    if (!ok) return;
    setBusyId(chip.id);
    try {
      await deleteBioChip(chip.id);
      await reload();
      setNotice(`“${chip.label}” removido.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível remover.");
    } finally {
      setBusyId(null);
    }
  }

  async function addTestimonial(e: FormEvent) {
    e.preventDefault();
    if (testimonialBusy) return;
    const quote = testimonialForm.quote.trim();
    if (!quote) {
      setError("Escreva o depoimento.");
      return;
    }
    setTestimonialBusy(true);
    setError(null);
    try {
      await createBioTestimonial({
        quote,
        author: testimonialForm.author.trim() || null,
        published: testimonialForm.published,
      });
      setTestimonialForm({ quote: "", author: "", published: true });
      await reload();
      setNotice("Depoimento adicionado.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível adicionar.");
    } finally {
      setTestimonialBusy(false);
    }
  }

  async function moveTestimonial(id: string, dir: -1 | 1) {
    const index = testimonials.findIndex((t) => t.id === id);
    const next = index + dir;
    if (index < 0 || next < 0 || next >= testimonials.length) return;
    const ids = testimonials.map((t) => t.id);
    const tmp = ids[index]!;
    ids[index] = ids[next]!;
    ids[next] = tmp;
    setBusyId(id);
    setTestimonials(
      ids.map((xid, i) => {
        const row = testimonials.find((t) => t.id === xid)!;
        return { ...row, sort_order: i };
      }),
    );
    try {
      await reorderBioTestimonials(ids);
      setNotice("Ordem dos depoimentos atualizada.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível reordenar.");
      await reload();
    } finally {
      setBusyId(null);
    }
  }

  async function toggleTestimonialPublished(item: BioTestimonial) {
    setBusyId(item.id);
    try {
      await patchBioTestimonial(item.id, { published: !item.published });
      await reload();
      setNotice(item.published ? "Depoimento ocultado." : "Depoimento publicado.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível atualizar.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeTestimonial(item: BioTestimonial) {
    const ok = window.confirm("Remover este depoimento?");
    if (!ok) return;
    setBusyId(item.id);
    try {
      await deleteBioTestimonial(item.id);
      await reload();
      setNotice("Depoimento removido.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível remover.");
    } finally {
      setBusyId(null);
    }
  }

  const editId = mode.type === "edit" ? mode.item.id : undefined;
  const draft = mode.type === "list" ? null : form;

  const phoneStatusLabel =
    phoneStatus === "saving" ? "Salvando…" : phoneStatus === "saved" ? "Salvo" : null;

  const previewProps = {
    items,
    profile,
    chips,
    testimonials,
    phone,
  };

  const phoneBlock = (
    <section className="ks-bio-phone-card">
      <h2 className="ks-bio-phone-title">WhatsApp do site</h2>
      <p className="ks-bio-phone-lead">
        <strong>Número global.</strong> Um só celular para bio, orçamento, flash, produtos, rodapé e
        botão flutuante. Mude aqui e todos os links de conversa acompanham.
      </p>
      <div className="ks-bio-phone-row">
        <label className={`ks-admin-field ks-bio-phone-field${fieldErrors.phone ? " has-error" : ""}`}>
          <span>Celular com DDD</span>
          <span className="ks-bio-phone-input">
            <span className="ks-bio-phone-prefix" aria-hidden="true">
              +55
            </span>
            <input
              value={phoneNational}
              onChange={(e) => {
                setPhoneNational(formatNational(e.target.value));
                setPhoneStatus("idle");
                setFieldErrors((err) => ({ ...err, phone: undefined }));
              }}
              onBlur={() => {
                if (phoneDirty && mode.type === "list") void savePhone();
              }}
              placeholder="(21) 99072-4477"
              disabled={phoneBusy || mode.type !== "list"}
              inputMode="tel"
              autoComplete="tel-national"
              aria-describedby="ks-bio-phone-ddi"
            />
          </span>
          <span id="ks-bio-phone-ddi" className="ks-admin-muted">
            DDI do Brasil já incluído.
          </span>
          {fieldErrors.phone ? <span className="ks-admin-field-error">{fieldErrors.phone}</span> : null}
          {phoneStatusLabel && !fieldErrors.phone ? (
            <span className="ks-bio-phone-status" role="status">
              {phoneStatusLabel}
            </span>
          ) : null}
        </label>
        {mode.type === "list" ? (
          <button
            type="button"
            className="ks-admin-btn ks-admin-btn--secondary"
            disabled={phoneBusy || !phoneDirty}
            onClick={() => void savePhone()}
          >
            {phoneBusy ? "Salvando…" : "Salvar número"}
          </button>
        ) : null}
      </div>
    </section>
  );

  const siteFooterBlock = (
    <label className={`ks-gallery-flag ks-bio-site-footer-flag${profile?.show_site_footer ? " is-on" : ""}`}>
      <input
        type="checkbox"
        checked={Boolean(profile?.show_site_footer)}
        disabled={footerBusy || loading || !profile}
        onChange={(e) => void toggleSiteFooter(e.target.checked)}
      />
      <span className="ks-gallery-flag-switch" aria-hidden="true" />
      <span className="ks-gallery-flag-copy">
        <strong>Mostrar “Site completo”</strong>
        <span>Link extra abaixo dos botões, apontando para a home do site.</span>
      </span>
    </label>
  );

  if (mode.type === "create" || mode.type === "edit") {
    return (
      <div className="ks-admin-shell">
        <header className="ks-admin-brand">
          <p className="ks-admin-kicker">
            <button type="button" className="ks-admin-back" onClick={() => setMode({ type: "list" })}>
              ← Links da bio
            </button>
          </p>
          <h1 className="ks-admin-title">{mode.type === "create" ? "Novo link" : "Editar link"}</h1>
          <p className="ks-admin-lead">Escolha o tipo — a URL do WhatsApp é montada pelo sistema.</p>
        </header>

        <div className="ks-bio-workspace">
          <div className="ks-bio-list-col">
            {phoneBlock}
            <form className="ks-admin-form ks-bio-form" onSubmit={(e) => void onSubmit(e)} noValidate>
            <div className="ks-bio-form-toolbar">
              <button
                type="button"
                className="ks-bio-back-btn"
                onClick={() => setMode({ type: "list" })}
                disabled={busy}
              >
                <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
                Voltar
              </button>
            </div>

            <div className="ks-bio-fields">
              <fieldset className="ks-bio-kind-field">
                <legend>Tipo de link</legend>
                <div className="ks-bio-kind-grid" role="radiogroup">
                  {KINDS.map((k) => (
                    <label key={k.id} className={`ks-bio-kind-option${form.kind === k.id ? " is-active" : ""}`}>
                      <input
                        type="radio"
                        name="bio-kind"
                        checked={form.kind === k.id}
                        onChange={() =>
                          setForm((f) => {
                            const nextKind = k.id;
                            let nextUrl = f.url;
                            let nextIcon = f.icon;
                            if (nextKind === "whatsapp") {
                              nextIcon = "whatsapp";
                              nextUrl = "";
                            } else if (nextKind === "internal") {
                              nextIcon = f.icon === "whatsapp" ? "link" : f.icon;
                              nextUrl = isSiteRoute(f.url) ? f.url : "/portfolio";
                            } else {
                              nextIcon = f.icon === "whatsapp" ? "link" : f.icon;
                              if (isSiteRoute(f.url) || f.url.startsWith("/")) nextUrl = "";
                            }
                            return { ...f, kind: nextKind, icon: nextIcon, url: nextUrl };
                          })
                        }
                        disabled={busy}
                      />
                      <strong>{k.label}</strong>
                      <span>{k.hint}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className={`ks-admin-field ks-admin-field--title${fieldErrors.label ? " has-error" : ""}`}>
                <span>Rótulo</span>
                <input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  maxLength={60}
                  disabled={busy}
                  required
                />
                {fieldErrors.label ? <span className="ks-admin-field-error">{fieldErrors.label}</span> : null}
              </label>

              {form.kind === "whatsapp" ? (
                <label className="ks-admin-field">
                  <span>Mensagem inicial (opcional)</span>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    rows={3}
                    maxLength={500}
                    disabled={busy}
                    placeholder="Olá! 🌿 Vim pela bio…"
                  />
                  <span className="ks-admin-muted">Usa o número do site. Acentos e emoji funcionam.</span>
                </label>
              ) : form.kind === "internal" ? (
                <div
                  ref={routeSelectRef}
                  className={`ks-bio-route-select${fieldErrors.url ? " has-error" : ""}${routeMenuOpen ? " is-open" : ""}`}
                >
                  <span className="ks-bio-route-label" id="bio-route-label">
                    Rota do site
                  </span>
                  <button
                    type="button"
                    className="ks-bio-route-trigger"
                    aria-haspopup="listbox"
                    aria-expanded={routeMenuOpen}
                    aria-labelledby="bio-route-label"
                    disabled={busy}
                    onClick={() => setRouteMenuOpen((open) => !open)}
                  >
                    <span className="ks-bio-route-trigger-copy">
                      <strong>{selectedRoute.label}</strong>
                      <span>{selectedRoute.path}</span>
                    </span>
                    <ChevronDown size={16} strokeWidth={2} className="ks-bio-route-chevron" aria-hidden="true" />
                  </button>
                  {routeMenuOpen ? (
                    <ul className="ks-bio-route-menu" role="listbox" aria-labelledby="bio-route-label">
                      {SITE_ROUTES.map((route) => {
                        const active = selectedRoute.path === route.path;
                        return (
                          <li key={route.path} role="presentation">
                            <button
                              type="button"
                              role="option"
                              aria-selected={active}
                              className={`ks-bio-route-option${active ? " is-active" : ""}`}
                              onClick={() => {
                                setForm((f) => ({ ...f, url: route.path }));
                                setRouteMenuOpen(false);
                              }}
                            >
                              <strong>{route.label}</strong>
                              <span>{route.path}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                  {fieldErrors.url ? <span className="ks-admin-field-error">{fieldErrors.url}</span> : null}
                </div>
              ) : (
                <label className={`ks-admin-field${fieldErrors.url ? " has-error" : ""}`}>
                  <span>URL</span>
                  <input
                    value={form.url}
                    onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                    placeholder="https://…"
                    disabled={busy}
                    required
                  />
                  {fieldErrors.url ? <span className="ks-admin-field-error">{fieldErrors.url}</span> : null}
                </label>
              )}

              {form.kind !== "whatsapp" ? (
                <fieldset className="ks-bio-icon-field">
                  <legend>Ícone</legend>
                  <div className="ks-bio-icon-grid" role="radiogroup" aria-label="Ícone do botão">
                    {ICONS.map((opt) => (
                      <label key={opt.id} className={`ks-bio-icon-option${form.icon === opt.id ? " is-active" : ""}`}>
                        <input
                          type="radio"
                          name="bio-icon"
                          value={opt.id}
                          checked={form.icon === opt.id}
                          onChange={() => setForm((f) => ({ ...f, icon: opt.id }))}
                          disabled={busy}
                        />
                        <span className="ks-bio-icon-option-glyph" aria-hidden="true">
                          {bioActionIcon(opt.id, 16)}
                        </span>
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}

              <div className="ks-bio-flags" role="group" aria-label="Destaque e publicação">
                <label className={`ks-bio-flag${form.featured ? " is-on" : ""}`}>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                    disabled={busy}
                  />
                  <span className="ks-bio-flag-switch" aria-hidden="true" />
                  <span className="ks-bio-flag-copy">
                    <strong>Destaque</strong>
                    <span>Botão escuro na bio</span>
                  </span>
                </label>

                <label className={`ks-bio-flag${form.published ? " is-on" : ""}`}>
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                    disabled={busy}
                  />
                  <span className="ks-bio-flag-switch" aria-hidden="true" />
                  <span className="ks-bio-flag-copy">
                    <strong>Publicado</strong>
                    <span>Visível no site</span>
                  </span>
                </label>
              </div>

              {fieldErrors.form ? (
                <p className="ks-admin-field-error" role="alert">
                  {fieldErrors.form}
                </p>
              ) : null}

              <div className="ks-gallery-form-actions">
                <button type="submit" className="ks-admin-btn" disabled={busy}>
                  {busy ? "Salvando…" : mode.type === "edit" ? "Salvar alterações" : "Adicionar"}
                </button>
                <button
                  type="button"
                  className="ks-admin-btn ks-admin-btn--secondary"
                  onClick={() => setMode({ type: "list" })}
                  disabled={busy}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
          </div>

          <aside className="ks-bio-preview-aside is-open">
            <BioLivePreview {...previewProps} editId={editId} draft={draft} />
          </aside>
        </div>
      </div>
    );
  }

  const subtitleDirty = subtitleDraft.trim() !== (profile?.subtitle || "");

  return (
    <div className="ks-admin-shell">
      <header className="ks-admin-brand ks-gallery-header">
        <div>
          <p className="ks-admin-kicker">Link da bio</p>
          <h1 className="ks-admin-title">Bio · CMS</h1>
          <p className="ks-admin-lead">Perfil, botões, estilos, depoimentos e estúdio da página /bio.</p>
        </div>
        <div className="ks-bio-header-actions">
          <button
            type="button"
            className="ks-admin-btn ks-admin-btn--secondary ks-bio-preview-toggle"
            onClick={() => setShowPreview((v) => !v)}
          >
            <Eye size={16} /> {showPreview ? "Ocultar prévia" : "Ver prévia"}
          </button>
          {tab === "links" ? (
            <button type="button" className="ks-admin-btn ks-gallery-add" onClick={openCreate}>
              Adicionar link
            </button>
          ) : null}
        </div>
      </header>

      <nav className="ks-bio-tabs" aria-label="Seções da bio">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`ks-bio-tab${tab === t.id ? " is-active" : ""}`}
            aria-current={tab === t.id ? "page" : undefined}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

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

      <div className="ks-bio-workspace ks-bio-workspace--list">
        <div className="ks-bio-list-col">
          {tab === "links" ? phoneBlock : null}
          {tab === "links" && !loading ? siteFooterBlock : null}

          {tab === "perfil" && !loading ? (
            <section className="ks-bio-panel">
              <h2 className="ks-bio-panel-title">Avatar, capa e subtítulo</h2>
              <p className="ks-bio-panel-lead">
                Capa no topo da bio, avatar e texto logo abaixo — o que aparece antes dos botões.
              </p>

              <div className="ks-bio-cover-block">
                <p className="ks-bio-field-label">Capa</p>
                <div className="ks-bio-cover-preview ks-bio-focal-host ks-bio-focal-host--cover">
                  <FocalPreview
                    src={profile?.cover_image_url || "/assets/projeto-destaque.webp"}
                    alt="Capa da bio"
                    value={coverFocal}
                    onChange={setCoverFocal}
                    onCommit={(next) => {
                      if (profile?.cover_image_url) void commitCoverFocal(next);
                      else setCoverFocal(next);
                    }}
                    disabled={coverBusy || !profile?.cover_image_url}
                  />
                </div>
                <div className="ks-bio-upload-actions">
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                    hidden
                    onChange={(e) => void onCoverFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    className="ks-admin-btn ks-admin-btn--secondary"
                    disabled={coverBusy}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {coverBusy ? "Enviando…" : "Trocar capa"}
                  </button>
                  {profile?.cover_image_url ? (
                    <button
                      type="button"
                      className="ks-admin-btn ks-admin-btn--secondary"
                      disabled={coverBusy}
                      onClick={() => void clearCover()}
                    >
                      Usar padrão
                    </button>
                  ) : null}
                  {coverBusy ? (
                    <span className="ks-admin-muted">
                      {coverStage === "uploading" || coverStage === "presigning"
                        ? "Enviando…"
                        : "Preparando imagem…"}
                    </span>
                  ) : (
                    <span className="ks-admin-muted">
                      {profile?.cover_image_url
                        ? "Arraste na prévia para enquadrar."
                        : "Sem capa customizada — usa a imagem padrão do site."}
                    </span>
                  )}
                </div>
              </div>

              <div className="ks-bio-avatar-block">
                <p className="ks-bio-field-label">Avatar</p>
                <div className="ks-bio-avatar-preview ks-bio-focal-host">
                  {profile?.avatar_url ? (
                    <FocalPreview
                      src={profile.avatar_url}
                      alt="Avatar atual"
                      value={avatarFocal}
                      onChange={setAvatarFocal}
                      onCommit={(next) => void commitAvatarFocal(next)}
                      disabled={avatarBusy}
                    />
                  ) : (
                    <span className="ks-bio-avatar-placeholder" aria-hidden="true" />
                  )}
                </div>
                <div className="ks-bio-upload-actions">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                    hidden
                    onChange={(e) => void onAvatarFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    className="ks-admin-btn ks-admin-btn--secondary"
                    disabled={avatarBusy}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    {avatarBusy ? "Enviando…" : "Trocar avatar"}
                  </button>
                  {avatarBusy || avatarStage === "done" || avatarStage === "error" ? (
                    <span className="ks-admin-muted">
                      {avatarStage === "presigning" || avatarStage === "uploading"
                        ? "Enviando foto…"
                        : avatarStage === "compressing" || avatarStage === "converting"
                          ? "Preparando imagem…"
                          : avatarStage === "done"
                            ? "Pronto"
                            : null}
                    </span>
                  ) : null}
                </div>
              </div>

              <label className="ks-admin-field">
                <span>Subtítulo</span>
                <input
                  value={subtitleDraft}
                  onChange={(e) => setSubtitleDraft(e.target.value)}
                  maxLength={80}
                  disabled={subtitleBusy}
                  placeholder="Tatuagem autoral · Teresópolis, RJ"
                />
                <span className="ks-admin-muted">{subtitleDraft.trim().length}/80</span>
              </label>
              <button
                type="button"
                className="ks-admin-btn"
                disabled={subtitleBusy || !subtitleDirty || !subtitleDraft.trim()}
                onClick={() => void saveSubtitle()}
              >
                {subtitleBusy ? "Salvando…" : "Salvar subtítulo"}
              </button>
            </section>
          ) : null}

          {tab === "links" ? (
            <>
              {!loading && items.length === 0 ? (
                <div className="ks-gallery-empty ks-bio-empty">
                  <img src="/assets/brand/star-karina-outline.webp" alt="" className="ks-gallery-empty-star" />
                  <p className="ks-bio-empty-title">A bio está sem botões</p>
                  <p className="ks-bio-empty-text">
                    Quem abrir o link do Instagram não vai ter nenhum caminho para falar com você. Adicione ao menos o
                    WhatsApp de orçamento.
                  </p>
                  <button type="button" className="ks-admin-btn" onClick={openCreate}>
                    Adicionar o primeiro link
                  </button>
                </div>
              ) : null}

              <ul className="ks-bio-list">
                {items.map((item, index) => {
                  const dest = destinationOf(item);
                  const label = normalizeBrandLabel(item.label);
                  return (
                    <li key={item.id}>
                      <div
                        className={`ks-bio-row ks-bio-row--compact${!item.published ? " is-hidden" : ""}${item.featured ? " is-featured" : ""}`}
                      >
                        <button type="button" className="ks-bio-row-hit" onClick={() => openEdit(item)}>
                          <span className={`ks-bio-row-glyph${item.featured ? " is-featured" : ""}`} aria-hidden="true">
                            {bioActionIcon(itemIcon(item), 16)}
                          </span>
                          <span className="ks-bio-row-main">
                            <span className="ks-bio-row-label-line">
                              <span className="ks-bio-row-label">{label}</span>
                              {item.featured ? (
                                <span className="ks-bio-chip ks-bio-chip--featured" title="Destaque na bio">
                                  ●
                                </span>
                              ) : null}
                              {!item.published ? <span className="ks-bio-chip">oculto</span> : null}
                              <span className="ks-bio-chip">{kindChipLabel(item.kind)}</span>
                            </span>
                            <span
                              className={`ks-bio-row-dest${dest.broken ? " is-broken" : ""}`}
                              title={dest.title}
                            >
                              {dest.text}
                            </span>
                          </span>
                        </button>
                        <span className="ks-bio-row-actions">
                          <span className="ks-bio-order" role="group" aria-label="Ordem">
                            <button
                              type="button"
                              className="ks-bio-order-btn"
                              aria-label="Subir"
                              disabled={index === 0 || busyId === item.id}
                              onClick={(e) => void move(item.id, -1, e)}
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button
                              type="button"
                              className="ks-bio-order-btn"
                              aria-label="Descer"
                              disabled={index === items.length - 1 || busyId === item.id}
                              onClick={(e) => void move(item.id, 1, e)}
                            >
                              <ChevronDown size={16} />
                            </button>
                          </span>
                          <button
                            type="button"
                            className="ks-bio-edit-btn"
                            aria-label={`Editar ${label}`}
                            onClick={() => openEdit(item)}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className="ks-bio-remove-btn"
                            aria-label={`Remover ${label}`}
                            disabled={busyId === item.id}
                            onClick={(e) => void remove(item, e)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}

          {tab === "estilos" && !loading ? (
            <section className="ks-bio-panel">
              <h2 className="ks-bio-panel-title">Estilos</h2>
              <p className="ks-bio-panel-lead">Chips da seção de linguagem visual.</p>

              <form className="ks-bio-quick-add" onSubmit={(e) => void addChip(e)}>
                <label className="ks-admin-field">
                  <span>Novo estilo</span>
                  <input
                    value={chipLabel}
                    onChange={(e) => setChipLabel(e.target.value)}
                    maxLength={30}
                    placeholder="ex.: blackwork"
                    disabled={chipBusy}
                  />
                </label>
                <button type="submit" className="ks-admin-btn" disabled={chipBusy || !chipLabel.trim()}>
                  {chipBusy ? "…" : "Adicionar"}
                </button>
              </form>

              {chips.length === 0 ? (
                <p className="ks-admin-muted">Nenhum estilo ainda.</p>
              ) : (
                <ul className="ks-bio-list">
                  {chips.map((chip, index) => (
                    <li key={chip.id}>
                      <div className="ks-bio-row ks-bio-row--compact">
                        <div className="ks-bio-row-hit ks-bio-row-hit--static">
                          {editingChipId === chip.id ? (
                            <input
                              className="ks-bio-inline-input"
                              value={editingChipLabel}
                              maxLength={30}
                              autoFocus
                              onChange={(e) => setEditingChipLabel(e.target.value)}
                              onBlur={() => void saveChipLabel(chip.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  void saveChipLabel(chip.id);
                                }
                                if (e.key === "Escape") setEditingChipId(null);
                              }}
                              disabled={busyId === chip.id}
                            />
                          ) : (
                            <button
                              type="button"
                              className="ks-bio-row-label ks-bio-inline-edit"
                              onClick={() => {
                                setEditingChipId(chip.id);
                                setEditingChipLabel(chip.label);
                              }}
                            >
                              {chip.label}
                            </button>
                          )}
                        </div>
                        <span className="ks-bio-row-actions">
                          <span className="ks-bio-order" role="group" aria-label="Ordem">
                            <button
                              type="button"
                              className="ks-bio-order-btn"
                              aria-label="Subir"
                              disabled={index === 0 || busyId === chip.id}
                              onClick={() => void moveChip(chip.id, -1)}
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button
                              type="button"
                              className="ks-bio-order-btn"
                              aria-label="Descer"
                              disabled={index === chips.length - 1 || busyId === chip.id}
                              onClick={() => void moveChip(chip.id, 1)}
                            >
                              <ChevronDown size={16} />
                            </button>
                          </span>
                          <button
                            type="button"
                            className="ks-bio-remove-btn"
                            aria-label={`Remover ${chip.label}`}
                            disabled={busyId === chip.id}
                            onClick={() => void removeChip(chip)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          {tab === "depoimentos" && !loading ? (
            <section className="ks-bio-panel">
              <h2 className="ks-bio-panel-title">Depoimentos</h2>
              <p className="ks-bio-panel-lead">Citações publicadas entram no carrossel da bio.</p>

              <form className="ks-bio-testimonial-form" onSubmit={(e) => void addTestimonial(e)}>
                <label className="ks-admin-field">
                  <span>Citação</span>
                  <textarea
                    value={testimonialForm.quote}
                    onChange={(e) => setTestimonialForm((f) => ({ ...f, quote: e.target.value }))}
                    rows={3}
                    maxLength={280}
                    disabled={testimonialBusy}
                    placeholder="Ficou simplesmente perfeita!"
                  />
                </label>
                <label className="ks-admin-field">
                  <span>Autora (opcional)</span>
                  <input
                    value={testimonialForm.author}
                    onChange={(e) => setTestimonialForm((f) => ({ ...f, author: e.target.value }))}
                    maxLength={60}
                    disabled={testimonialBusy}
                  />
                </label>
                <label className={`ks-bio-flag${testimonialForm.published ? " is-on" : ""}`}>
                  <input
                    type="checkbox"
                    checked={testimonialForm.published}
                    onChange={(e) => setTestimonialForm((f) => ({ ...f, published: e.target.checked }))}
                    disabled={testimonialBusy}
                  />
                  <span className="ks-bio-flag-switch" aria-hidden="true" />
                  <span className="ks-bio-flag-copy">
                    <strong>Publicado</strong>
                    <span>Visível na bio</span>
                  </span>
                </label>
                <button
                  type="submit"
                  className="ks-admin-btn"
                  disabled={testimonialBusy || !testimonialForm.quote.trim()}
                >
                  {testimonialBusy ? "Salvando…" : "Adicionar depoimento"}
                </button>
              </form>

              {testimonials.length === 0 ? (
                <p className="ks-admin-muted">Nenhum depoimento ainda.</p>
              ) : (
                <ul className="ks-bio-list">
                  {testimonials.map((item, index) => (
                    <li key={item.id}>
                      <div className={`ks-bio-row ks-bio-row--compact${!item.published ? " is-hidden" : ""}`}>
                        <div className="ks-bio-row-hit ks-bio-row-hit--static ks-bio-testimonial-main">
                          <span className="ks-bio-row-label-line">
                            <span className="ks-bio-row-label">“{item.quote}”</span>
                            {!item.published ? <span className="ks-bio-chip">oculto</span> : null}
                          </span>
                          {item.author ? <span className="ks-bio-row-dest">{item.author}</span> : null}
                        </div>
                        <span className="ks-bio-row-actions">
                          <span className="ks-bio-order" role="group" aria-label="Ordem">
                            <button
                              type="button"
                              className="ks-bio-order-btn"
                              aria-label="Subir"
                              disabled={index === 0 || busyId === item.id}
                              onClick={() => void moveTestimonial(item.id, -1)}
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button
                              type="button"
                              className="ks-bio-order-btn"
                              aria-label="Descer"
                              disabled={index === testimonials.length - 1 || busyId === item.id}
                              onClick={() => void moveTestimonial(item.id, 1)}
                            >
                              <ChevronDown size={16} />
                            </button>
                          </span>
                          <button
                            type="button"
                            className="ks-bio-edit-btn"
                            aria-label={item.published ? "Ocultar" : "Publicar"}
                            disabled={busyId === item.id}
                            onClick={() => void toggleTestimonialPublished(item)}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            className="ks-bio-remove-btn"
                            aria-label="Remover depoimento"
                            disabled={busyId === item.id}
                            onClick={() => void removeTestimonial(item)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          {tab === "estudio" && !loading ? (
            <section className="ks-bio-panel">
              <h2 className="ks-bio-panel-title">Estúdio</h2>
              <p className="ks-bio-panel-lead">Foto da seção “meu studio” na bio pública.</p>

              <div className="ks-bio-studio-preview ks-bio-focal-host ks-bio-focal-host--studio">
                {profile?.studio_image_url ? (
                  <FocalPreview
                    src={profile.studio_image_url}
                    alt="Estúdio atual"
                    value={studioFocal}
                    onChange={setStudioFocal}
                    onCommit={(next) => void commitStudioFocal(next)}
                    disabled={studioBusy}
                  />
                ) : (
                  <span className="ks-bio-studio-placeholder">Sem imagem</span>
                )}
              </div>
              <div className="ks-bio-upload-actions">
                <input
                  ref={studioInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                  hidden
                  onChange={(e) => void onStudioFile(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  className="ks-admin-btn"
                  disabled={studioBusy}
                  onClick={() => studioInputRef.current?.click()}
                >
                  {studioBusy ? "Enviando…" : "Trocar foto do estúdio"}
                </button>
                {studioBusy ? (
                  <span className="ks-admin-muted">
                    {studioStage === "uploading" || studioStage === "presigning"
                      ? "Enviando…"
                      : "Preparando imagem…"}
                  </span>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>

        <aside className={`ks-bio-preview-aside${showPreview ? " is-open" : ""}`}>
          <BioLivePreview {...previewProps} />
        </aside>
      </div>
    </div>
  );
}
