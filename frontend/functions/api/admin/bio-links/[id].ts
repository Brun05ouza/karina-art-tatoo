import type { PagesFunction } from "@cloudflare/workers-types";
import { authenticateRequest } from "../../../_lib/auth";
import { deleteLink, findById, updateLink, validatePatch } from "../../../_lib/bio-links";
import { type Env, error, handleError, json } from "../../../_lib/config";

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");

    const id = String(context.params.id ?? "");
    if (!id) return error(400, "Link inválido.");

    const current = await findById(context.env, id);
    if (!current) return error(404, "Link não encontrado.");

    let body: Record<string, unknown>;
    try {
      body = (await context.request.json()) as Record<string, unknown>;
    } catch {
      return error(400, "Corpo da requisição inválido.");
    }

    const parsed = validatePatch(body);
    if (!parsed.ok) return error(400, parsed.message);

    const item = await updateLink(context.env, id, parsed.value);
    if (!item) return error(404, "Link não encontrado.");

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
    if (!id) return error(400, "Link inválido.");

    const deleted = await deleteLink(context.env, id);
    if (!deleted) return error(404, "Link não encontrado.");

    return json({ ok: true, id: deleted.id });
  } catch (err) {
    return handleError(err);
  }
};
