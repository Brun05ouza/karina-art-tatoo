import type { PagesFunction } from "@cloudflare/workers-types";
import { listPublished } from "../_lib/bio-links";
import { type Env, handleError, json } from "../_lib/config";

const CACHE =
  "public, max-age=60, s-maxage=300, stale-while-revalidate=86400";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const items = await listPublished(context.env);
    return json({ items }, { headers: { "Cache-Control": CACHE } });
  } catch (err) {
    return handleError(err);
  }
};
