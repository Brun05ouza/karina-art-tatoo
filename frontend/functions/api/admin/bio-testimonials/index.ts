import type { PagesFunction } from "@cloudflare/workers-types";
import { authenticateRequest } from "../../../_lib/auth";
import {
  createTestimonial,
  listAllTestimonials,
  validateTestimonialCreate,
} from "../../../_lib/bio-profile";
import { type Env, error, handleError, json } from "../../../_lib/config";
import {
  BIO_PROFILE_PUBLIC_PATH,
  invalidatePublicPaths,
} from "../../../_lib/public-cache";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");

    const items = await listAllTestimonials(context.env);
    return json({ items });
  } catch (err) {
    return handleError(err);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");

    let body: Record<string, unknown>;
    try {
      body = (await context.request.json()) as Record<string, unknown>;
    } catch {
      return error(400, "Corpo da requisição inválido.");
    }

    const parsed = validateTestimonialCreate(body);
    if (!parsed.ok) return error(400, parsed.message);

    const item = await createTestimonial(context.env, parsed.value);

    context.waitUntil(
      invalidatePublicPaths(context.request, context.env, [BIO_PROFILE_PUBLIC_PATH]),
    );

    return json({ ok: true, item }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
};
