import { getAllArticles } from "@/lib/blog/articles";
import { absoluteUrl, site } from "@/lib/site";

/** Clave IndexNow (pública: debe existir en /{key}.txt). */
export const INDEXNOW_KEY = "870a5b04203a4c28b8620e87a601845c";

export const INDEXNOW_KEY_PATH = `/${INDEXNOW_KEY}.txt`;

export function indexNowKeyLocation(): string {
  return absoluteUrl(INDEXNOW_KEY_PATH);
}

export function indexNowHost(): string {
  return new URL(site.url).host;
}

/** URLs públicas prioritarias para IndexNow (home + guía). */
export function getIndexNowUrlList(): string[] {
  const articles = getAllArticles().map((article) =>
    absoluteUrl(`/guia/${article.slug}`),
  );
  return [
    site.url,
    absoluteUrl("/guia"),
    absoluteUrl("/acerca"),
    absoluteUrl("/terminos"),
    ...articles,
  ];
}

export type IndexNowSubmitResult = {
  ok: boolean;
  status: number;
  submitted: number;
  body: string;
};

/**
 * Envía URLs a IndexNow (Bing / Yandex / etc. vía api.indexnow.org).
 * @see https://www.indexnow.org/documentation
 */
export async function submitIndexNowUrls(
  urls: string[],
  fetchImpl: typeof fetch = fetch,
): Promise<IndexNowSubmitResult> {
  const host = indexNowHost();
  const key = INDEXNOW_KEY;
  const keyLocation = indexNowKeyLocation();

  const allowed = urls.filter((url) => {
    try {
      return new URL(url).host === host;
    } catch {
      return false;
    }
  });

  const unique = Array.from(new Set(allowed));
  if (unique.length === 0) {
    return { ok: false, status: 400, submitted: 0, body: "No hay URLs válidas del host." };
  }

  const response = await fetchImpl("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key,
      keyLocation,
      urlList: unique,
    }),
  });

  const body = await response.text().catch(() => "");
  // IndexNow: 200/202 = aceptado
  const ok = response.status === 200 || response.status === 202;
  return { ok, status: response.status, submitted: unique.length, body };
}
