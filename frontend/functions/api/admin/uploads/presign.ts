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
import { createSignedUploadUrl } from "../../../_lib/supabase";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");

    let body: { collection?: string; contentType?: string };
    try {
      body = (await context.request.json()) as { collection?: string; contentType?: string };
    } catch {
      return error(400, "Corpo da requisição inválido.");
    }

    const collection = String(body.collection ?? "");

    const contentType = String(body.contentType ?? "").toLowerCase().trim();
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(contentType)) {
      return error(
        400,
        "Formato não aceito. Use JPEG, PNG, WebP ou AVIF (HEIC deve ser convertido antes).",
      );
    }

    const ext = extensionForMime(contentType);
    if (!ext) return error(400, "Formato de imagem não suportado.");

    let path: string;
    if (isBioUploadCollection(collection)) {
      path = buildBioObjectKey(collection, ext);
    } else if (isGalleryCollection(collection)) {
      path = buildObjectKey(collection, ext);
    } else {
      return error(
        400,
        "Coleção inválida. Use portfolio, flash, produtos, bio-avatar ou bio-studio.",
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
