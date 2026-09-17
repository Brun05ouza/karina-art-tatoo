import type { PagesFunction } from "@cloudflare/workers-types";
import { getPublicBundle } from "../_lib/bio-profile";
import { type Env, handleError, json } from "../_lib/config";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const bundle = await getPublicBundle(context.env);
    return json(bundle, { headers: { "Cache-Control": "no-store", "CDN-Cache-Control": "no-store" } });
  } catch (err) {
    return handleError(err);
  }
};
