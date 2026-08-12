// Copia os binários do @ffmpeg/core (~32 MB) para public/ffmpeg/ antes do dev
// e do build. Ficam de fora do git (ver .gitignore) e são só self-hosted para
// não depender de um CDN externo — regenerados a cada `npm install`.
import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// require.resolve("@ffmpeg/core/package.json") esbarra no "exports" do
// pacote, que não expõe esse subpath — resolvemos pela entrada real e subimos
// até a raiz do pacote a partir dela.
//
// Precisa ser a build ESM (não a UMD): o worker do @ffmpeg/ffmpeg 0.12.x
// carrega o núcleo via `import()`, e a build UMD não tem `export` nenhum —
// falha em silêncio com "failed to import ffmpeg-core.js".
const require = createRequire(import.meta.url);
const entry = require.resolve("@ffmpeg/core");
const coreRoot = join(dirname(entry), "..", "..");
const srcDir = join(coreRoot, "dist", "esm");
const destDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "ffmpeg");

mkdirSync(destDir, { recursive: true });

for (const name of ["ffmpeg-core.js", "ffmpeg-core.wasm"]) {
  const src = join(srcDir, name);
  if (!existsSync(src)) {
    console.error(`[ffmpeg] arquivo não encontrado: ${src}`);
    process.exit(1);
  }
  copyFileSync(src, join(destDir, name));
}

console.log(`[ffmpeg] core copiado para ${destDir}`);
