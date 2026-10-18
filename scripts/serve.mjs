import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

/**
 * Petit serveur statique pour prévisualiser le build sans dépendance.
 * Usage : node scripts/serve.mjs [port]
 */
const ROOT = resolve(import.meta.dirname, "..", "dist");
const PORT = Number(process.argv[2] ?? 4174);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".json": "application/json",
};

async function fileExists(path) {
  try {
    const info = await stat(path);
    return info.isFile();
  } catch {
    return false;
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://localhost:${PORT}`);
  const requested = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(ROOT, requested);

  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  if (!(await fileExists(filePath))) {
    // Repli SPA : toute route inconnue renvoie index.html.
    filePath = join(ROOT, "index.html");
    if (!(await fileExists(filePath))) {
      response.writeHead(404).end("Build introuvable — lancez d'abord `pnpm build`.");
      return;
    }
  }

  const body = await readFile(filePath);
  response.writeHead(200, {
    "content-type": MIME[extname(filePath)] ?? "application/octet-stream",
    "cache-control": "no-cache",
  });
  response.end(body);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`WikiTCG servi sur http://127.0.0.1:${PORT}`);
});
