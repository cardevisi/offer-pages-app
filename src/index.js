// Worker do offer-pages-app.
//
// Os arquivos de ./public são servidos pelo Cloudflare antes do Worker rodar
// (assets têm prioridade), então as páginas feitas à mão continuam iguais e
// uma página do R2 nunca sobrescreve uma estática com o mesmo caminho.
// O Worker só roda quando nenhum asset estático bate com a URL e, nesse caso,
// procura a página no bucket R2 (binding PAGES), onde o app-campaign-ads publica
// as páginas aprovadas.
//
// Layout no bucket: <slug>/index.html e arquivos ao lado (<slug>/hero.webp...).

const HTML_CACHE = "public, max-age=60";
const ASSET_CACHE = "public, max-age=86400";

// Converte o caminho da URL na chave do R2. Devolve null para caminhos inválidos.
export function keyFor(pathname) {
  let path;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.some((p) => p === "." || p === ".." || p.includes("\\"))) return null;
  if (!parts.every((p) => /^[A-Za-z0-9._-]+$/.test(p))) return null;
  const key = parts.join("/");
  return path.endsWith("/") ? `${key}/index.html` : key;
}

function notFound() {
  return new Response("Not found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    }
    const url = new URL(request.url);
    const key = keyFor(url.pathname);
    if (!key) return notFound();

    let object = await env.PAGES.get(key);

    // /<slug> sem barra: se existir /<slug>/index.html, redireciona mantendo a query
    // (o gclid precisa chegar à página).
    if (!object && !key.endsWith("index.html") && !/\.[A-Za-z0-9]+$/.test(key)) {
      const index = await env.PAGES.head(`${key}/index.html`);
      if (index) {
        url.pathname = `/${key}/`;
        return Response.redirect(url.toString(), 301);
      }
    }
    if (!object) return notFound();

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    const isHtml = key.endsWith(".html");
    if (isHtml && !headers.has("content-type")) {
      headers.set("content-type", "text/html; charset=utf-8");
    }
    headers.set("cache-control", isHtml ? HTML_CACHE : ASSET_CACHE);
    headers.set("x-content-type-options", "nosniff");

    return new Response(request.method === "HEAD" ? null : object.body, { headers });
  },
};
