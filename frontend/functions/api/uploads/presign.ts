import { requireAdmin } from "../../_lib/auth";
import { error, handleError, json, requireSupabaseConfig, type Env } from "../../_lib/config";
import { createSignedUploadUrl, getPublicUrl } from "../../_lib/supabase";
import { EXTENSION_BY_TYPE, FOLDER_PATTERN, isMediaType, readJson } from "../../_lib/validation";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!(await requireAdmin(request, env))) return error(401, "Não autorizado.");

    const body = await readJson<{ contentType?: unknown; folder?: unknown }>(request);
    const folder = typeof body?.folder === "string" && body.folder ? body.folder : "site";

    if (!body || !isMediaType(body.contentType) || !FOLDER_PATTERN.test(folder)) {
      return error(400, "Formato ou pasta de upload inválidos.");
    }

    const config = requireSupabaseConfig(env);
    const extension = EXTENSION_BY_TYPE[body.contentType];
    const objectKey = `${folder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;

    const uploadUrl = await createSignedUploadUrl(config, objectKey);
    if (!uploadUrl) return error(502, "Não foi possível gerar o link de upload.");

    return json({
      objectKey,
      publicUrl: getPublicUrl(config, objectKey),
      uploadUrl,
      requiredHeaders: { "Content-Type": body.contentType },
    });
  } catch (cause) {
    return handleError(cause);
  }
};
