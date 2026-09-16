import type { PagesFunction } from "@cloudflare/workers-types";
import { authenticateRequest } from "../../_lib/auth";
import { type Env, error, handleError, json } from "../../_lib/config";
import {
  BIO_LINKS_PUBLIC_PATH,
  invalidatePublicPaths,
  SETTINGS_PUBLIC_PATH,
} from "../../_lib/public-cache";
import {
  formatBrWhatsapp,
  getDevelopmentMode,
  getWhatsappPhone,
  setDevelopmentMode,
  setWhatsappPhone,
} from "../../_lib/site-settings";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");

    const whatsappPhone = await getWhatsappPhone(context.env);
    const developmentMode = await getDevelopmentMode(context.env);
    return json({
      whatsappPhone,
      whatsappPhoneDisplay: formatBrWhatsapp(whatsappPhone),
      developmentMode,
    });
  } catch (err) {
    return handleError(err);
  }
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const identity = await authenticateRequest(context.request, context.env);
    if (!identity) return error(401, "Faça login para continuar.");

    let body: Record<string, unknown>;
    try {
      body = (await context.request.json()) as Record<string, unknown>;
    } catch {
      return error(400, "Corpo da requisição inválido.");
    }

    if (!("whatsappPhone" in body) && !("developmentMode" in body)) {
      return error(400, "Informe whatsappPhone ou developmentMode.");
    }

    let whatsappPhone = await getWhatsappPhone(context.env);
    if ("whatsappPhone" in body) {
      const result = await setWhatsappPhone(context.env, body.whatsappPhone);
      if (!result.ok) return error(400, result.message);
      whatsappPhone = result.phone;
    }

    let developmentMode = await getDevelopmentMode(context.env);
    if ("developmentMode" in body) {
      if (typeof body.developmentMode !== "boolean") {
        return error(400, "developmentMode precisa ser verdadeiro ou falso.");
      }
      await setDevelopmentMode(context.env, body.developmentMode);
      developmentMode = body.developmentMode;
    }

    context.waitUntil(
      invalidatePublicPaths(context.request, context.env, [
        SETTINGS_PUBLIC_PATH,
        BIO_LINKS_PUBLIC_PATH,
      ]),
    );

    return json({
      ok: true,
      whatsappPhone,
      whatsappPhoneDisplay: formatBrWhatsapp(whatsappPhone),
      developmentMode,
    });
  } catch (err) {
    return handleError(err);
  }
};
