import { isTrustedRequestOrigin } from "../../_lib/auth";
import { error, handleError, type Env } from "../../_lib/config";
import { buildClearedSessionCookie } from "../../_lib/session";

export const onRequestPost: PagesFunction<Env> = async ({ request }) => {
  try {
    if (!isTrustedRequestOrigin(request)) {
      return error(403, "Origem não permitida.");
    }

    return new Response(null, {
      status: 204,
      headers: {
        "set-cookie": buildClearedSessionCookie(request),
        "cache-control": "no-store",
      },
    });
  } catch (cause) {
    return handleError(cause);
  }
};
