import type { PagesFunction } from "@cloudflare/workers-types";
import { type Env, handleError, json } from "../_lib/config";
import { PUBLIC_API_CACHE } from "../_lib/public-cache";
import {
  FALLBACK_WHATSAPP_PHONE,
  formatBrWhatsapp,
  getWhatsappPhone,
} from "../_lib/site-settings";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    let whatsappPhone = FALLBACK_WHATSAPP_PHONE;
    try {
      whatsappPhone = await getWhatsappPhone(context.env);
    } catch {
      /* fallback */
    }
    return json(
      {
        whatsappPhone,
        whatsappPhoneDisplay: formatBrWhatsapp(whatsappPhone),
      },
      { headers: { "Cache-Control": PUBLIC_API_CACHE } },
    );
  } catch (err) {
    return handleError(err);
  }
};
