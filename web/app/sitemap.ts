import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages = site.indexedPaths.map((path) => ({
    url: path === "/" ? site.url : absoluteUrl(path),
    lastModified,
    changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "/" ? 1 : 0.5,
  }));

  return staticPages;
}
