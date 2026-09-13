import type { PagesFunction } from "@cloudflare/workers-types";
import { listPublished } from "../_lib/bio-links";
import { type Env, handleError, json } from "../_lib/config";
import { PUBLIC_API_CACHE } from "../_lib/public-cache";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const items = await listPublished(context.env);
    return json({ items }, { headers: { "Cache-Control": PUBLIC_API_CACHE } });
  } catch (err) {
    return handleError(err);
  }
};
