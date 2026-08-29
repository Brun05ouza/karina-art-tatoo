/** Vídeos de processo — só via CMS/admin; sem fallback local. */
export const processVideos = {
  artProcess: {
    src: "",
    poster: "",
  },
} as const;

export type ProcessVideoKey = keyof typeof processVideos;
