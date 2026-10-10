#!/usr/bin/env node
/**
 * Envía URLs públicas a IndexNow (Bing / Yandex vía api.indexnow.org).
 *
 * Uso (desde web/):
 *   npm run indexnow
 *   npm run indexnow -- https://www.nominapp.xyz/guia/recargos-dominicales-nocturnos-colombia-2026
 */
const KEY = "870a5b04203a4c28b8620e87a601845c";
const HOST = "www.nominapp.xyz";
const BASE = `https://${HOST}`;
const KEY_LOCATION = `${BASE}/${KEY}.txt`;

const extra = process.argv.slice(2).filter((a) => a.startsWith("http"));

async function loadUrlsFromSitemap() {
  const res = await fetch(`${BASE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const urlList =
  extra.length > 0
    ? extra
    : await loadUrlsFromSitemap().catch(() => [
        BASE,
        `${BASE}/guia`,
        `${BASE}/acerca`,
        `${BASE}/terminos`,
      ]);

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  }),
});

const text = await response.text();
const ok = response.status === 200 || response.status === 202;

console.log(
  JSON.stringify(
    {
      status: response.status,
      ok,
      submitted: urlList.length,
      keyLocation: KEY_LOCATION,
      sample: urlList.slice(0, 5),
      body: text.slice(0, 500),
    },
    null,
    2,
  ),
);

if (!ok) process.exitCode = 1;
