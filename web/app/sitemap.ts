import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/blog/articles";
import { absoluteUrl, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages = site.indexedPaths.map((path) => ({
    url: path === "/" ? site.url : absoluteUrl(path),
    lastModified,
    changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "/" ? 1 : 0.5,
  }));

  const guiaIndex = {
    url: absoluteUrl("/guia"),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  };

  const articles = getAllSlugs().map((slug) => ({
    url: absoluteUrl(`/guia/${slug}`),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, guiaIndex, ...articles];
}
