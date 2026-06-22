import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/guia",
        "/inicio",
        "/login",
        "/restablecer-contrasena",
        "/api/",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: site.url,
  };
}
