import { getAllArticles, getArticleModifiedAt } from "@/lib/blog/articles";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const articles = [...getAllArticles()].sort((a, b) =>
    getArticleModifiedAt(b).localeCompare(getArticleModifiedAt(a)),
  );
  const latest = articles[0]
    ? getArticleModifiedAt(articles[0])
    : new Date().toISOString().slice(0, 10);

  const items = articles
    .map((article) => {
      const url = absoluteUrl(`/guia/${article.slug}`);
      const pubDate = new Date(article.publishedAt).toUTCString();
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(article.description)}</description>
      <category>${escapeXml("Nómina Colombia")}</category>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${site.name} — Guía de nómina`)}</title>
    <link>${absoluteUrl("/guia")}</link>
    <description>${escapeXml(
      "Artículos sobre liquidación, recargos, auxilio de transporte y derechos laborales para empleados en Colombia.",
    )}</description>
    <language>es-co</language>
    <lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
