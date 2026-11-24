// Testa src/index.js com um bucket R2 em memória. Rodar: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import worker, { keyFor } from "../src/index.js";

function bucket(files) {
  const obj = (key) => ({
    body: files[key],
    httpEtag: `"${key}"`,
    writeHttpMetadata(h) {
      if (key.endsWith(".webp")) h.set("content-type", "image/webp");
    },
  });
  return {
    async get(key) {
      return key in files ? obj(key) : null;
    },
    async head(key) {
      return key in files ? obj(key) : null;
    },
  };
}

const env = {
  PAGES: bucket({
    "prodentim-review/index.html": "<h1>review</h1>",
    "prodentim-review/hero.webp": "IMG",
  }),
};
const get = (path, method = "GET") => worker.fetch(new Request("https://pages.test" + path, { method }), env);

test("serve a página do R2 com HTML e cache curto", async () => {
  const res = await get("/prodentim-review/?gclid=abc");
  assert.equal(res.status, 200);
  assert.equal(await res.text(), "<h1>review</h1>");
  assert.match(res.headers.get("content-type"), /text\/html/);
  assert.equal(res.headers.get("cache-control"), "public, max-age=60");
});

test("serve arquivos ao lado da página com o content-type do R2", async () => {
  const res = await get("/prodentim-review/hero.webp");
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "image/webp");
});

test("sem barra final redireciona e mantém a query (gclid)", async () => {
  const res = await get("/prodentim-review?gclid=abc&keyword=x");
  assert.equal(res.status, 301);
  assert.equal(res.headers.get("location"), "https://pages.test/prodentim-review/?gclid=abc&keyword=x");
});

test("caminho inexistente dá 404", async () => {
  assert.equal((await get("/nao-existe/")).status, 404);
  assert.equal((await get("/")).status, 404);
});

test("HEAD sem corpo e métodos de escrita recusados", async () => {
  const head = await get("/prodentim-review/", "HEAD");
  assert.equal(head.status, 200);
  assert.equal(head.body, null);
  assert.equal((await get("/prodentim-review/", "POST")).status, 405);
});

test("keyFor recusa travessia e caracteres estranhos", () => {
  assert.equal(keyFor("/a/../b/"), null);
  assert.equal(keyFor("/%2e%2e/x"), null);
  assert.equal(keyFor("/a\\b"), null);
  assert.equal(keyFor("/a b/"), null);
  assert.equal(keyFor("/%E0%A4%A"), null);
  assert.equal(keyFor("/slug/"), "slug/index.html");
  assert.equal(keyFor("/slug/img.png"), "slug/img.png");
});
