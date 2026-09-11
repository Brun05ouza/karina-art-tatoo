import type { PagesFunction } from "@cloudflare/workers-types";
import { type Env, handleError, json } from "../_lib/config";
import {
  FALLBACK_WHATSAPP_PHONE,
  formatBrWhatsapp,
  getWhatsappPhone,
} from "../_lib/site-settings";

const CACHE =
  "public, max-age=60, s-maxage=300, stale-while-revalidate=86400";

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
      { headers: { "Cache-Control": CACHE } },
    );
  } catch (err) {
    return handleError(err);
  }
};
