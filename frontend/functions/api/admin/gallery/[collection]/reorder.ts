import type { PagesFunction } from "@cloudflare/workers-types";
import { authenticateRequest } from "../../../../_lib/auth";
import { type Env, error, handleError, json } from "../../../../_lib/config";
import { isGalleryCollection, reorderItems } from "../../../../_lib/gallery";
import {
  galleryPublicPaths,
  invalidatePublicPaths,
} from "../../../../_lib/public-cache";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");

    const collection = String(context.params.collection ?? "");
    if (!isGalleryCollection(collection)) {
      return error(400, "Coleção inválida. Use portfolio, flash ou produtos.");
    }

    let body: { ids?: unknown };
    try {
      body = (await context.request.json()) as { ids?: unknown };
    } catch {
      return error(400, "Corpo da requisição inválido.");
    }

    const ids = Array.isArray(body.ids) ? body.ids.map(String) : null;
    if (!ids) return error(400, "Envie { ids: string[] }.");

    const result = await reorderItems(context.env, collection, ids);
    if (!result.ok) return error(400, result.message);

    context.waitUntil(
      invalidatePublicPaths(context.request, context.env, galleryPublicPaths(collection)),
    );

    return json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
};
