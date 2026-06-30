/** Vídeos de processo criativo — hover nos cards para mostrar como a arte é feita. */
export const processVideos = {
  artProcess: {
    src: "/assets/process/art-process.mp4",
    poster: "/assets/process/art-process-poster.jpg",
  },
} as const;

export type ProcessVideoKey = keyof typeof processVideos;
