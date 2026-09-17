import type { PagesFunction } from "@cloudflare/workers-types";
import { authenticateRequest } from "../../../../_lib/auth";
import { type Env, error, handleError, json } from "../../../../_lib/config";
import {
  deleteItem,
  findItemById,
  setItemFeatured,
  updateItem,
  validatePatch,
  assertPublishAllowed,
} from "../../../../_lib/gallery";
import {
  galleryPublicPaths,
  invalidatePublicPaths,
} from "../../../../_lib/public-cache";
import { removeObject } from "../../../../_lib/supabase";

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");

    const id = String(context.params.id ?? "");
    if (!id) return error(400, "Item inválido.");

    const current = await findItemById(context.env, id);
    if (!current) return error(404, "Item não encontrado.");

    let body: Record<string, unknown>;
    try {
      body = (await context.request.json()) as Record<string, unknown>;
    } catch {
      return error(400, "Corpo da requisição inválido.");
    }

    const parsed = validatePatch(current.collection, body);
    if (!parsed.ok) return error(400, parsed.message);

    const publishGate = assertPublishAllowed(current.collection, current, parsed.value);
    if (!publishGate.ok) return error(400, publishGate.message);

    if (parsed.value.featured === true && !(parsed.value.published ?? current.published)) {
      return error(
        400,
        "Não dá para destacar um item oculto. Publique-o primeiro e depois marque como destaque.",
      );
    }

    const previousKey =
      parsed.value.image_key && parsed.value.image_key !== current.image_key
        ? current.image_key
        : null;

    const previousAfterKey =
      parsed.value.after_image_key !== undefined &&
      parsed.value.after_image_key !== current.after_image_key &&
      current.after_image_key
        ? current.after_image_key
        : null;

    const { featured: featuredPatch, ...restPatch } = parsed.value;
    let item =
      Object.keys(restPatch).length > 0
        ? await updateItem(context.env, id, restPatch)
        : current;
    if (!item) return error(404, "Item não encontrado.");

    if (featuredPatch === true) {
      try {
        item = await setItemFeatured(context.env, id, true);
      } catch (err) {
        if (err instanceof Error && err.message === "HIDDEN_FEATURED") {
          return error(
            400,
            "Não dá para destacar um item oculto. Publique-o primeiro e depois marque como destaque.",
          );
        }
        throw err;
      }
      if (!item) return error(404, "Item não encontrado.");
    } else if (featuredPatch === false) {
      item = await setItemFeatured(context.env, id, false);
      if (!item) return error(404, "Item não encontrado.");
    }

    for (const key of [previousKey, previousAfterKey]) {
      if (!key) continue;
      try {
        const removed = await removeObject(context.env, key);
        if (!removed.ok) {
          console.error("[gallery] falha ao apagar imagem antiga", key, removed);
        }
      } catch (err) {
        console.error("[gallery] falha ao apagar imagem antiga", key, err);
      }
    }

    context.waitUntil(
      invalidatePublicPaths(context.request, context.env, galleryPublicPaths(item.collection)),
    );

    return json({ ok: true, item });
  } catch (err) {
    return handleError(err);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");

    const id = String(context.params.id ?? "");
    if (!id) return error(400, "Item inválido.");

    const deleted = await deleteItem(context.env, id);
    if (!deleted) return error(404, "Item não encontrado.");

    context.waitUntil(
      invalidatePublicPaths(context.request, context.env, galleryPublicPaths(deleted.collection)),
    );

    const keys = [deleted.image_key, deleted.after_image_key].filter(
      (key): key is string => Boolean(key?.trim()),
    );
    for (const key of keys) {
      try {
        const removed = await removeObject(context.env, key);
        if (!removed.ok) {
          console.error(
            "[gallery] item removido do Neon, mas falhou no bucket:",
            key,
            removed,
          );
        }
      } catch (err) {
        console.error("[gallery] falha ao limpar bucket após delete:", key, err);
      }
    }

    return json({ ok: true, id: deleted.id });
  } catch (err) {
    return handleError(err);
  }
};
