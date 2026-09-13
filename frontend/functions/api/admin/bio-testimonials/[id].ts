import type { PagesFunction } from "@cloudflare/workers-types";
import { authenticateRequest } from "../../../_lib/auth";
import {
  deleteTestimonial,
  findTestimonialById,
  updateTestimonial,
  validateTestimonialPatch,
} from "../../../_lib/bio-profile";
import { type Env, error, handleError, json } from "../../../_lib/config";
import {
  BIO_PROFILE_PUBLIC_PATH,
  invalidatePublicPaths,
} from "../../../_lib/public-cache";

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");

    const id = String(context.params.id ?? "");
    if (!id) return error(400, "Depoimento inválido.");

    const current = await findTestimonialById(context.env, id);
    if (!current) return error(404, "Depoimento não encontrado.");

    let body: Record<string, unknown>;
    try {
      body = (await context.request.json()) as Record<string, unknown>;
    } catch {
      return error(400, "Corpo da requisição inválido.");
    }

    const parsed = validateTestimonialPatch(body);
    if (!parsed.ok) return error(400, parsed.message);

    const item = await updateTestimonial(context.env, id, parsed.value);
    if (!item) return error(404, "Depoimento não encontrado.");

    context.waitUntil(
      invalidatePublicPaths(context.request, context.env, [BIO_PROFILE_PUBLIC_PATH]),
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
    if (!id) return error(400, "Depoimento inválido.");

    const deleted = await deleteTestimonial(context.env, id);
    if (!deleted) return error(404, "Depoimento não encontrado.");

    context.waitUntil(
      invalidatePublicPaths(context.request, context.env, [BIO_PROFILE_PUBLIC_PATH]),
    );

    return json({ ok: true, id: deleted.id });
  } catch (err) {
    return handleError(err);
  }
};
