import type { PagesFunction } from "@cloudflare/workers-types";
import { type Env, error, handleError, json } from "../../../_lib/config";
import { isGalleryCollection, listPublished, toPublicItem } from "../../../_lib/gallery";
import { PUBLIC_API_CACHE } from "../../../_lib/public-cache";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const collection = String(context.params.collection ?? "");
    if (!isGalleryCollection(collection)) {
      return error(400, "Coleção inválida. Use portfolio, flash ou produtos.");
    }

    const items = await listPublished(context.env, collection);
    return json(
      { collection, items: items.map(toPublicItem) },
      { headers: { "Cache-Control": PUBLIC_API_CACHE } },
    );
  } catch (err) {
    return handleError(err);
  }
};
