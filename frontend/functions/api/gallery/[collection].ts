import type { PagesFunction } from "@cloudflare/workers-types";
import { type Env, error, handleError, json } from "../../_lib/config";
import { isGalleryCollection, listPublished, toPublicItem } from "../../_lib/gallery";

const CACHE =
  "public, max-age=60, s-maxage=300, stale-while-revalidate=86400";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const collection = String(context.params.collection ?? "");
    if (!isGalleryCollection(collection)) {
      return error(400, "Coleção inválida. Use portfolio, flash ou produtos.");
    }

    const items = await listPublished(context.env, collection);
    return json(
      { collection, items: items.map(toPublicItem) },
      { headers: { "Cache-Control": CACHE } },
    );
  } catch (err) {
    return handleError(err);
  }
};
