import type { PagesFunction } from "@cloudflare/workers-types";
import { authenticateRequest } from "../../../_lib/auth";
import {
  buildBioObjectKey,
  isBioUploadCollection,
} from "../../../_lib/bio-profile";
import { type Env, error, handleError, json } from "../../../_lib/config";
import {
  ALLOWED_IMAGE_TYPES,
  buildObjectKey,
  extensionForMime,
  isGalleryCollection,
} from "../../../_lib/gallery";
import { YOUTUBE_VIDEO_MAX_BYTES } from "../../../_lib/site-settings";
import { createSignedUploadUrl } from "../../../_lib/supabase";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");

    let body: { collection?: string; contentType?: string; bytes?: number };
    try {
      body = (await context.request.json()) as { collection?: string; contentType?: string; bytes?: number };
    } catch {
      return error(400, "Corpo da requisição inválido.");
    }

    const collection = String(body.collection ?? "");

    const contentType = String(body.contentType ?? "").toLowerCase().trim();
    const isYoutubeThumb = collection === "youtube-thumb";
    const isYoutubeTrailer = collection === "youtube-trailer";
    const isProductsHero = collection === "products-hero";
    const isAbout = collection === "about";
    if (contentType === "video/quicktime" || contentType === "video/mov") {
      return error(
        400,
        "MOV não é aceito. No iPhone: abra o vídeo → Compartilhar → Salvar vídeo e escolha Mais compatível, ou exporte em MP4.",
      );
    }
    const allowed = isYoutubeTrailer
      ? ["video/mp4", "video/webm"]
      : ALLOWED_IMAGE_TYPES;
    if (!(allowed as readonly string[]).includes(contentType)) {
      return error(
        400,
        isYoutubeTrailer
          ? "Formato de vídeo não aceito. Use MP4 ou WebM."
          : "Formato não aceito. Use JPEG, PNG, WebP ou AVIF (HEIC deve ser convertido antes).",
      );
    }
    if (isYoutubeTrailer) {
      const bytes = Number(body.bytes);
      if (!Number.isFinite(bytes) || bytes <= 0) {
        return error(400, "Informe o tamanho do vídeo.");
      }
      if (bytes > YOUTUBE_VIDEO_MAX_BYTES) {
        return error(400, "O vídeo passa de 10 MB. Envie um teaser mais curto, em MP4 ou WebM.");
      }
    }
    if (isProductsHero || isAbout) {
      const bytes = Number(body.bytes);
      if (!Number.isFinite(bytes) || bytes <= 0) {
        return error(400, "Informe o tamanho da imagem.");
      }
      if (bytes > 2 * 1024 * 1024) {
        return error(
          400,
          isAbout
            ? "A imagem do Sobre passa de 2 MB. Exporte em WebP ou PNG mais leve."
            : "A imagem do hero passa de 2 MB. Exporte em WebP ou PNG mais leve.",
        );
      }
    }

    const ext = isYoutubeTrailer
      ? contentType === "video/webm"
        ? "webm"
        : "mp4"
      : extensionForMime(contentType);
    if (!ext) return error(400, "Formato de imagem não suportado.");

    let path: string;
    if (isYoutubeThumb) {
      path = `youtube/thumb/${crypto.randomUUID()}.${ext}`;
    } else if (isYoutubeTrailer) {
      path = `youtube/trailer/${crypto.randomUUID()}.${ext}`;
    } else if (isProductsHero) {
      path = `products/hero/${crypto.randomUUID()}.${ext}`;
    } else if (isAbout) {
      path = `about/${crypto.randomUUID()}.${ext}`;
    } else if (isBioUploadCollection(collection)) {
      path = buildBioObjectKey(collection, ext);
    } else if (isGalleryCollection(collection)) {
      path = buildObjectKey(collection, ext);
    } else {
      return error(
        400,
        "Coleção inválida. Use portfolio, flash, produtos, bio-avatar, bio-studio, bio-cover, youtube, products-hero ou about.",
      );
    }

    const signed = await createSignedUploadUrl(context.env, path);

    return json({
      ok: true,
      path: signed.path,
      token: signed.token,
      signedUrl: signed.signedUrl,
      publicUrl: signed.publicUrl,
      contentType,
    });
  } catch (err) {
    return handleError(err);
  }
};
