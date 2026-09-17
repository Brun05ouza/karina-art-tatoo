import type { PagesFunction } from "@cloudflare/workers-types";
import { listPublished } from "../_lib/bio-links";
import { type Env, handleError, json } from "../_lib/config";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const items = await listPublished(context.env);
    return json({ items }, { headers: { "Cache-Control": "no-store", "CDN-Cache-Control": "no-store" } });
  } catch (err) {
    return handleError(err);
  }
};
