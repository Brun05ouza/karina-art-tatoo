import type { PagesFunction } from "@cloudflare/workers-types";
import { type Env, error, handleError, json } from "../../../_lib/config";
import {
  getFeaturedOrFirst,
  isGalleryCollection,
  toPublicItem,
} from "../../../_lib/gallery";
import { PUBLIC_API_CACHE } from "../../../_lib/public-cache";

/**
 * Destaque da coleção (ou primeiro publicado). Incluído também na lista
 * `/api/gallery/:collection` via flag `featured` — este endpoint evita
 * baixar a galeria inteira quando só a home/seção precisa de um item.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const collection = String(context.params.collection ?? "");
    if (!isGalleryCollection(collection)) {
      return error(400, "Coleção inválida. Use portfolio, flash ou produtos.");
    }

    const item = await getFeaturedOrFirst(context.env, collection);
    return json(
      { collection, item: item ? toPublicItem(item) : null },
      { headers: { "Cache-Control": PUBLIC_API_CACHE } },
    );
  } catch (err) {
    return handleError(err);
  }
};
