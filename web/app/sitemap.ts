import type { MetadataRoute } from "next";
import { getAllArticles, getArticleModifiedAt } from "@/lib/blog/articles";
import { absoluteUrl, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const latestArticleDate = articles.reduce((latest, article) => {
    const modified = getArticleModifiedAt(article);
    return modified > latest ? modified : latest;
  }, "2026-01-01");

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: site.url,
      lastModified: new Date(latestArticleDate),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/guia"),
      lastModified: new Date(latestArticleDate),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/terminos"),
      lastModified: new Date("2026-06-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(`/guia/${article.slug}`),
    lastModified: new Date(getArticleModifiedAt(article)),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...articlePages];
}
