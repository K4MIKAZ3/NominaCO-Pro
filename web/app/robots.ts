import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/lib/site";

const privateDisallow = [
  "/inicio",
  "/login",
  "/restablecer-contrasena",
  "/api/",
];

/** Bots de IA / answer engines: permitimos crawl de contenido público para citación. */
const aiUserAgents = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "GoogleOther",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privateDisallow,
      },
      ...aiUserAgents.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: privateDisallow,
      })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: site.url,
  };
}
