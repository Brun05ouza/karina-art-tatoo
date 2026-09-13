import type { PagesFunction } from "@cloudflare/workers-types";
import { authenticateRequest } from "../../_lib/auth";
import {
  getAdminBundle,
  getProfile,
  updateProfile,
  validateProfilePatch,
} from "../../_lib/bio-profile";
import { type Env, error, handleError, json } from "../../_lib/config";
import {
  BIO_PROFILE_PUBLIC_PATH,
  invalidatePublicPaths,
} from "../../_lib/public-cache";
import { removeObject } from "../../_lib/supabase";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");

    const bundle = await getAdminBundle(context.env);
    return json(bundle);
  } catch (err) {
    return handleError(err);
  }
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");

    const current = await getProfile(context.env);
    if (!current) return error(404, "Perfil da bio não encontrado.");

    let body: Record<string, unknown>;
    try {
      body = (await context.request.json()) as Record<string, unknown>;
    } catch {
      return error(400, "Corpo da requisição inválido.");
    }

    const parsed = validateProfilePatch(body);
    if (!parsed.ok) return error(400, parsed.message);

    const previousAvatarKey =
      parsed.value.avatar_key !== undefined &&
      parsed.value.avatar_key !== current.avatar_key &&
      current.avatar_key
        ? current.avatar_key
        : null;

    const previousStudioKey =
      parsed.value.studio_image_key !== undefined &&
      parsed.value.studio_image_key !== current.studio_image_key &&
      current.studio_image_key
        ? current.studio_image_key
        : null;

    const profile = await updateProfile(context.env, parsed.value);
    if (!profile) return error(404, "Perfil da bio não encontrado.");

    for (const previousKey of [previousAvatarKey, previousStudioKey]) {
      if (!previousKey) continue;
      try {
        const removed = await removeObject(context.env, previousKey);
        if (!removed.ok) {
          console.error("[bio-profile] falha ao apagar imagem antiga", previousKey, removed);
        }
      } catch (err) {
        console.error("[bio-profile] falha ao apagar imagem antiga", previousKey, err);
      }
    }

    context.waitUntil(
      invalidatePublicPaths(context.request, context.env, [BIO_PROFILE_PUBLIC_PATH]),
    );

    return json({ ok: true, profile });
  } catch (err) {
    return handleError(err);
  }
};
