// Testa public/resourses/link-format.js com um DOM mínimo (sem dependências).
// Rodar: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const script = readFileSync(join(root, "public/resourses/link-format.js"), "utf8");

// Executa o script numa página com os hrefs dados e a query string dada;
// devolve os hrefs depois da reescrita.
function run(hrefs, query = "") {
  const links = hrefs.map((href) => ({ href }));
  const context = {
    window: { location: { search: query, href: "https://example.test/p/" + query } },
    document: { querySelectorAll: () => links },
    console: { log() {}, warn() {} },
    URL,
    URLSearchParams,
  };
  vm.runInNewContext(script, context);
  return links.map((l) => new URL(l.href));
}

const GCLID = "?gclid=Cj0KCQ_teste&keyword=dentes&matchtype=e&device=m";

test("hoplink com tid livre (tid=google_ads) recebe extclid", () => {
  const [u] = run(["https://abc.hop.clickbank.net/?&traffic_type=paid&tid=google_ads"], GCLID);
  assert.equal(u.searchParams.get("extclid"), "Cj0KCQ_teste");
  assert.equal(u.searchParams.get("tid"), "google_ads", "tid existente é preservado");
  assert.equal(u.searchParams.get("aff_sub1"), "dentes");
});

test("hoplink sem parâmetros recebe tid=gads e extclid", () => {
  const [u] = run(["https://abc.hop.clickbank.net"], GCLID);
  assert.equal(u.searchParams.get("extclid"), "Cj0KCQ_teste");
  assert.equal(u.searchParams.get("tid"), "gads");
});

test("sem gclid na URL, extclid não é enviado (nada de valor fixo)", () => {
  const [u] = run(["https://abc.hop.clickbank.net/?tid=clickbank"], "");
  assert.equal(u.searchParams.has("extclid"), false);
});

test("links que não são de afiliado ficam intactos", () => {
  const hrefs = [
    "https://abc.hop.clickbank.net/?tid=clickbank",
    "https://example.test/privacy-policy.html",
    "https://outro.site/?tid=qualquer",
    "mailto:contato@example.test",
  ];
  const out = run(hrefs, GCLID);
  assert.equal(out[1].href, hrefs[1]);
  assert.equal(out[2].href, hrefs[2]);
  assert.equal(out[3].href, hrefs[3]);
});

test("smartadv: sub2 só com gclid real", () => {
  const href = "https://track.example/2SXCKM4J/ZQ32J5P/?source_id=smartadv";
  assert.equal(run([href], GCLID)[0].searchParams.get("sub2"), "Cj0KCQ_teste");
  assert.equal(run([href], "")[0].searchParams.has("sub2"), false);
});

// Todas as páginas publicadas que têm hoplink da ClickBank e carregam o script
// precisam sair com extclid quando o clique traz gclid.
test("todas as páginas com hoplink propagam o gclid", () => {
  const pub = join(root, "public");
  const checked = [];
  for (const dir of readdirSync(pub)) {
    const file = join(pub, dir, "index.html");
    if (!existsSync(file)) continue;
    const html = readFileSync(file, "utf8");
    if (!html.includes("link-format.js")) continue;
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((h) => /^https?:\/\//.test(h));
    const hop = hrefs.filter((h) => new URL(h).hostname.endsWith("hop.clickbank.net"));
    if (!hop.length) continue;
    for (const u of run(hrefs, GCLID)) {
      if (u.hostname.endsWith("hop.clickbank.net")) {
        assert.equal(u.searchParams.get("extclid"), "Cj0KCQ_teste", `${dir}: ${u.href}`);
      }
    }
    checked.push(dir);
  }
  assert.ok(checked.length > 0, "nenhuma página verificada");
});
