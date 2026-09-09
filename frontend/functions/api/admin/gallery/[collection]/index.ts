import type { PagesFunction } from "@cloudflare/workers-types";
import { authenticateRequest } from "../../../../_lib/auth";
import { type Env, error, handleError, json } from "../../../../_lib/config";
import {
  createItem,
  isGalleryCollection,
  listAll,
  validateCreate,
} from "../../../../_lib/gallery";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");

    const collection = String(context.params.collection ?? "");
    if (!isGalleryCollection(collection)) {
      return error(400, "Coleção inválida. Use portfolio, flash ou produtos.");
    }

    const items = await listAll(context.env, collection);
    return json({ collection, items });
  } catch (err) {
    return handleError(err);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");

    const collection = String(context.params.collection ?? "");
    if (!isGalleryCollection(collection)) {
      return error(400, "Coleção inválida. Use portfolio, flash ou produtos.");
    }

    let body: Record<string, unknown>;
    try {
      body = (await context.request.json()) as Record<string, unknown>;
    } catch {
      return error(400, "Corpo da requisição inválido.");
    }

    const parsed = validateCreate(collection, body);
    if (!parsed.ok) return error(400, parsed.message);

    const item = await createItem(context.env, collection, parsed.value);
    return json({ ok: true, item }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
};
