import type { PagesFunction } from "@cloudflare/workers-types";
import { type Env, handleError } from "../../_lib/config";
import { buildClearCookie } from "../../_lib/session";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const headers = new Headers({ "Content-Type": "application/json; charset=utf-8" });
    for (const cookie of buildClearCookie(context.request)) {
      headers.append("Set-Cookie", cookie);
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (err) {
    return handleError(err);
  }
};
