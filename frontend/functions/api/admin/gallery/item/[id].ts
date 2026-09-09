import type { PagesFunction } from "@cloudflare/workers-types";
import { authenticateRequest } from "../../../../_lib/auth";
import { type Env, error, handleError, json } from "../../../../_lib/config";
import { deleteItem, findItemById, updateItem, validatePatch } from "../../../../_lib/gallery";
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

    const previousKey =
      parsed.value.image_key && parsed.value.image_key !== current.image_key
        ? current.image_key
        : null;

    const item = await updateItem(context.env, id, parsed.value);
    if (!item) return error(404, "Item não encontrado.");

    if (previousKey) {
      try {
        const removed = await removeObject(context.env, previousKey);
        if (!removed.ok) {
          console.error("[gallery] falha ao apagar imagem antiga", previousKey, removed);
        }
      } catch (err) {
        console.error("[gallery] falha ao apagar imagem antiga", previousKey, err);
      }
    }

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

    try {
      const removed = await removeObject(context.env, deleted.image_key);
      if (!removed.ok) {
        console.error(
          "[gallery] item removido do Neon, mas falhou no bucket:",
          deleted.image_key,
          removed,
        );
      }
    } catch (err) {
      // Arquivo órfão é preferível a item fantasma na tela
      console.error("[gallery] falha ao limpar bucket após delete:", deleted.image_key, err);
    }

    return json({ ok: true, id: deleted.id });
  } catch (err) {
    return handleError(err);
  }
};
