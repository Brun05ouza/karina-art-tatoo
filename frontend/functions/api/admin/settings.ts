import type { PagesFunction } from "@cloudflare/workers-types";
import { authenticateRequest } from "../../_lib/auth";
import { type Env, error, handleError, json } from "../../_lib/config";
import {
  BIO_LINKS_PUBLIC_PATH,
  invalidatePublicPaths,
  SETTINGS_PUBLIC_PATH,
} from "../../_lib/public-cache";
import { removeObject } from "../../_lib/supabase";
import {
  formatBrWhatsapp,
  getAboutMedia,
  getAboutMediaSlot,
  getDevelopmentMode,
  getProductsHero,
  getWhatsappPhone,
  getYoutubeFeature,
  isAboutMediaSlotId,
  publicAboutMedia,
  setAboutMedia,
  setDevelopmentMode,
  setProductsHero,
  setProductsHeroFocal,
  setWhatsappPhone,
  setYoutubeThumb,
  setYoutubeTrailer,
  setYoutubeUrl,
  setYoutubeVisible,
  validateStoredMediaUrl,
  withAboutHiddenSection,
  withAboutMediaSlot,
  type AboutMediaSettings,
  type AboutMediaSlot,
  type ProductsHeroSettings,
  type YoutubeFeatureSettings,
} from "../../_lib/site-settings";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");

    const whatsappPhone = await getWhatsappPhone(context.env);
    const developmentMode = await getDevelopmentMode(context.env);
    const youtube = await getYoutubeFeature(context.env);
    const productsHero = await getProductsHero(context.env);
    const aboutMedia = await getAboutMedia(context.env);
    return json({
      whatsappPhone,
      whatsappPhoneDisplay: formatBrWhatsapp(whatsappPhone),
      developmentMode,
      ...publicYoutube(youtube),
      ...publicProductsHero(productsHero),
      ...publicAboutMedia(aboutMedia),
    });
  } catch (err) {
    return handleError(err);
  }
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");

    let body: Record<string, unknown>;
    try {
      body = (await context.request.json()) as Record<string, unknown>;
    } catch {
      return error(400, "Corpo da requisição inválido.");
    }

    const hasYoutube =
      "youtubeVisible" in body ||
      "youtubeUrl" in body ||
      "youtubeThumbUrl" in body ||
      "youtubeTrailerUrl" in body ||
      body.clearYoutubeThumb === true ||
      body.clearYoutubeTrailer === true;
    const hasProductsHero =
      "productsHeroImageUrl" in body ||
      body.clearProductsHeroImage === true ||
      "productsHeroFocalX" in body ||
      "productsHeroFocalY" in body;
    const hasAboutMedia =
      "aboutMediaSlot" in body ||
      "aboutMedia" in body ||
      body.clearAboutMediaSlot != null ||
      "aboutHiddenSection" in body;
    if (
      !("whatsappPhone" in body) &&
      !("developmentMode" in body) &&
      !hasYoutube &&
      !hasProductsHero &&
      !hasAboutMedia
    ) {
      return error(
        400,
        "Informe whatsappPhone, developmentMode, os campos do vídeo, o hero de produtos ou as fotos do Sobre.",
      );
    }

    let whatsappPhone = await getWhatsappPhone(context.env);
    if ("whatsappPhone" in body) {
      const result = await setWhatsappPhone(context.env, body.whatsappPhone);
      if (!result.ok) return error(400, result.message);
      whatsappPhone = result.phone;
    }

    let developmentMode = await getDevelopmentMode(context.env);
    if ("developmentMode" in body) {
      if (typeof body.developmentMode !== "boolean") {
        return error(400, "developmentMode precisa ser verdadeiro ou falso.");
      }
      await setDevelopmentMode(context.env, body.developmentMode);
      developmentMode = body.developmentMode;
    }

    let youtube = await getYoutubeFeature(context.env);
    if ("youtubeVisible" in body) {
      if (typeof body.youtubeVisible !== "boolean") {
        return error(400, "youtubeVisible precisa ser verdadeiro ou falso.");
      }
      await setYoutubeVisible(context.env, body.youtubeVisible);
      youtube = { ...youtube, visible: body.youtubeVisible };
    }
    if ("youtubeUrl" in body) {
      const result = await setYoutubeUrl(context.env, body.youtubeUrl);
      if (!result.ok) return error(400, result.message);
      youtube = { ...youtube, youtubeUrl: result.url };
    }
    if (body.clearYoutubeThumb === true || "youtubeThumbUrl" in body) {
      const replaced = await replaceYoutubeMedia(context, youtube, "thumb", body);
      if (!replaced.ok) return error(400, replaced.message);
      youtube = replaced.youtube;
    }
    if (body.clearYoutubeTrailer === true || "youtubeTrailerUrl" in body) {
      const replaced = await replaceYoutubeMedia(context, youtube, "trailer", body);
      if (!replaced.ok) return error(400, replaced.message);
      youtube = replaced.youtube;
    }

    let productsHero = await getProductsHero(context.env);
    const replacingImage =
      "productsHeroImageUrl" in body || body.clearProductsHeroImage === true;
    if (replacingImage) {
      const replaced = await replaceProductsHero(context, productsHero, body);
      if (!replaced.ok) return error(400, replaced.message);
      productsHero = replaced.productsHero;
    } else if ("productsHeroFocalX" in body || "productsHeroFocalY" in body) {
      const nextX =
        typeof body.productsHeroFocalX === "number"
          ? body.productsHeroFocalX
          : productsHero.focalX;
      const nextY =
        typeof body.productsHeroFocalY === "number"
          ? body.productsHeroFocalY
          : productsHero.focalY;
      if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) {
        return error(400, "Enquadramento inválido.");
      }
      await setProductsHeroFocal(context.env, nextX, nextY);
      productsHero = { ...productsHero, focalX: nextX, focalY: nextY };
    }

    let aboutMedia = await getAboutMedia(context.env);
    if (hasAboutMedia) {
      if ("aboutHiddenSection" in body) {
        const payload =
          body.aboutHiddenSection && typeof body.aboutHiddenSection === "object"
            ? (body.aboutHiddenSection as Record<string, unknown>)
            : null;
        const sectionId = typeof payload?.id === "string" ? payload.id.trim() : "";
        if (typeof payload?.hidden !== "boolean" || !sectionId) {
          return error(400, "Informe a seção do Sobre e se deve ficar oculta.");
        }
        const next = withAboutHiddenSection(aboutMedia, sectionId, payload.hidden);
        if (!next) return error(400, "Seção do Sobre inválida.");
        await setAboutMedia(context.env, next);
        aboutMedia = next;
      } else {
        const replaced = await replaceAboutMediaSlot(context, aboutMedia, body);
        if (!replaced.ok) return error(400, replaced.message);
        aboutMedia = replaced.aboutMedia;
      }
    }

    context.waitUntil(
      invalidatePublicPaths(context.request, context.env, [
        SETTINGS_PUBLIC_PATH,
        BIO_LINKS_PUBLIC_PATH,
      ]),
    );

    return json({
      ok: true,
      whatsappPhone,
      whatsappPhoneDisplay: formatBrWhatsapp(whatsappPhone),
      developmentMode,
      ...publicYoutube(youtube),
      ...publicProductsHero(productsHero),
      ...publicAboutMedia(aboutMedia),
    });
  } catch (err) {
    return handleError(err);
  }
};

function publicYoutube(youtube: YoutubeFeatureSettings) {
  return {
    youtubeVisible: youtube.visible,
    youtubeUrl: youtube.youtubeUrl,
    youtubeThumbUrl: youtube.thumbUrl,
    youtubeThumbKey: youtube.thumbKey,
    youtubeTrailerUrl: youtube.trailerUrl,
    youtubeTrailerKey: youtube.trailerKey,
  };
}

function publicProductsHero(productsHero: ProductsHeroSettings) {
  return {
    productsHeroImageUrl: productsHero.imageUrl,
    productsHeroImageKey: productsHero.imageKey,
    productsHeroFocalX: productsHero.focalX,
    productsHeroFocalY: productsHero.focalY,
  };
}

async function replaceYoutubeMedia(
  context: Parameters<PagesFunction<Env>>[0],
  youtube: YoutubeFeatureSettings,
  kind: "thumb" | "trailer",
  body: Record<string, unknown>,
): Promise<{ ok: true; youtube: YoutubeFeatureSettings } | { ok: false; message: string }> {
  const clearing = kind === "thumb" ? body.clearYoutubeThumb === true : body.clearYoutubeTrailer === true;
  const urlField = kind === "thumb" ? "youtubeThumbUrl" : "youtubeTrailerUrl";
  const keyField = kind === "thumb" ? "youtubeThumbKey" : "youtubeTrailerKey";
  const nextUrl = clearing ? "" : body[urlField];
  const nextKey = clearing ? "" : typeof body[keyField] === "string" ? body[keyField].trim() : "";
  const check = validateStoredMediaUrl(nextUrl);
  if (!check.ok) return check;
  if (check.url && !nextKey) {
    return { ok: false, message: "Faltou a chave do arquivo enviado." };
  }

  const previousKey = kind === "thumb" ? youtube.thumbKey : youtube.trailerKey;
  if (previousKey && previousKey !== nextKey) {
    context.waitUntil(removeObject(context.env, previousKey));
  }
  if (kind === "thumb") await setYoutubeThumb(context.env, check.url, nextKey);
  else await setYoutubeTrailer(context.env, check.url, nextKey);
  return {
    ok: true,
    youtube:
      kind === "thumb"
        ? { ...youtube, thumbUrl: check.url, thumbKey: nextKey }
        : { ...youtube, trailerUrl: check.url, trailerKey: nextKey },
  };
}

async function replaceProductsHero(
  context: Parameters<PagesFunction<Env>>[0],
  productsHero: ProductsHeroSettings,
  body: Record<string, unknown>,
): Promise<{ ok: true; productsHero: ProductsHeroSettings } | { ok: false; message: string }> {
  const clearing = body.clearProductsHeroImage === true;
  const nextUrl = clearing ? "" : body.productsHeroImageUrl;
  const nextKey = clearing
    ? ""
    : typeof body.productsHeroImageKey === "string"
      ? body.productsHeroImageKey.trim()
      : "";
  const check = validateStoredMediaUrl(nextUrl);
  if (!check.ok) return check;
  if (check.url && !nextKey) {
    return { ok: false, message: "Faltou a chave do arquivo enviado." };
  }

  if (productsHero.imageKey && productsHero.imageKey !== nextKey) {
    context.waitUntil(removeObject(context.env, productsHero.imageKey));
  }
  const focalX =
    typeof body.productsHeroFocalX === "number" ? body.productsHeroFocalX : clearing ? 50 : productsHero.focalX;
  const focalY =
    typeof body.productsHeroFocalY === "number" ? body.productsHeroFocalY : clearing ? 50 : productsHero.focalY;
  await setProductsHero(context.env, check.url, nextKey, focalX, focalY);
  return {
    ok: true,
    productsHero: { imageUrl: check.url, imageKey: nextKey, focalX, focalY },
  };
}

async function replaceAboutMediaSlot(
  context: Parameters<PagesFunction<Env>>[0],
  aboutMedia: AboutMediaSettings,
  body: Record<string, unknown>,
): Promise<{ ok: true; aboutMedia: AboutMediaSettings } | { ok: false; message: string }> {
  const clearId = body.clearAboutMediaSlot;
  const slotPayload =
    body.aboutMediaSlot && typeof body.aboutMediaSlot === "object"
      ? (body.aboutMediaSlot as Record<string, unknown>)
      : null;

  const slotId = isAboutMediaSlotId(clearId)
    ? clearId
    : slotPayload && isAboutMediaSlotId(slotPayload.id)
      ? slotPayload.id
      : null;

  if (!slotId) {
    return { ok: false, message: "Informe o slot da foto do Sobre." };
  }

  const previous = getAboutMediaSlot(aboutMedia, slotId);
  const clearing = isAboutMediaSlotId(clearId);

  let nextSlot: AboutMediaSlot;
  if (clearing) {
    nextSlot = { url: "", key: "", focalX: 50, focalY: 50 };
  } else {
    const nextUrl = slotPayload?.url;
    const nextKey = typeof slotPayload?.key === "string" ? slotPayload.key.trim() : "";
    const check = validateStoredMediaUrl(nextUrl);
    if (!check.ok) return check;
    if (check.url && !nextKey) {
      return { ok: false, message: "Faltou a chave do arquivo enviado." };
    }
    const focalOnly = !("url" in (slotPayload ?? {})) && !("key" in (slotPayload ?? {}));
    if (focalOnly) {
      const focalX =
        typeof slotPayload?.focalX === "number" ? slotPayload.focalX : previous.focalX;
      const focalY =
        typeof slotPayload?.focalY === "number" ? slotPayload.focalY : previous.focalY;
      if (!Number.isFinite(focalX) || !Number.isFinite(focalY)) {
        return { ok: false, message: "Enquadramento inválido." };
      }
      nextSlot = { ...previous, focalX, focalY };
    } else {
      nextSlot = {
        url: check.url,
        key: nextKey,
        focalX: typeof slotPayload?.focalX === "number" ? slotPayload.focalX : 50,
        focalY: typeof slotPayload?.focalY === "number" ? slotPayload.focalY : 50,
      };
    }
  }

  if (previous.key && previous.key !== nextSlot.key) {
    context.waitUntil(removeObject(context.env, previous.key));
  }

  const next = withAboutMediaSlot(aboutMedia, slotId, nextSlot);
  await setAboutMedia(context.env, next);
  return { ok: true, aboutMedia: next };
}
