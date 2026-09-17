import type { PagesFunction } from "@cloudflare/workers-types";
import { type Env, json } from "../_lib/config";
import { SETTINGS_API_CACHE } from "../_lib/public-cache";
import {
  formatBrWhatsapp,
  getDevelopmentMode,
  getProductsHero,
  getWhatsappPhone,
  getYoutubeFeature,
} from "../_lib/site-settings";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const whatsappPhone = await getWhatsappPhone(context.env);
    const developmentMode = await getDevelopmentMode(context.env);
    const youtube = await getYoutubeFeature(context.env);
    const productsHero = await getProductsHero(context.env);
    return json(
      {
        whatsappPhone,
        whatsappPhoneDisplay: formatBrWhatsapp(whatsappPhone),
        developmentMode,
        youtubeVisible: youtube.visible,
        youtubeUrl: youtube.youtubeUrl,
        youtubeThumbUrl: youtube.thumbUrl,
        youtubeTrailerUrl: youtube.trailerUrl,
        productsHeroImageUrl: productsHero.imageUrl,
        productsHeroFocalX: productsHero.focalX,
        productsHeroFocalY: productsHero.focalY,
      },
      { headers: { "Cache-Control": SETTINGS_API_CACHE } },
    );
  } catch {
    // 503, não 200 com false: um false aqui publicaria o site incompleto.
    return json(
      { error: "Configurações indisponíveis." },
      { status: 503, headers: { "Cache-Control": SETTINGS_API_CACHE } },
    );
  }
};
