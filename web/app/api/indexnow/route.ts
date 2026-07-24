import { NextResponse } from "next/server";
import {
  getIndexNowUrlList,
  submitIndexNowUrls,
} from "@/lib/indexnow";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authorize(request: Request): boolean {
  const secret =
    process.env.INDEXNOW_SUBMIT_SECRET ?? process.env.CRON_SECRET ?? "";
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const query = new URL(request.url).searchParams.get("secret") ?? "";
  return bearer === secret || query === secret;
}

/**
 * POST /api/indexnow
 * Body opcional: { "urls": ["https://www.nominapp.xyz/..."] }
 * Sin body: envía todas las URLs públicas del sitemap lógico.
 * Auth: Authorization: Bearer $INDEXNOW_SUBMIT_SECRET (o ?secret=)
 */
export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let urls = getIndexNowUrlList();
  try {
    const body = (await request.json()) as { urls?: unknown };
    if (Array.isArray(body?.urls) && body.urls.every((u) => typeof u === "string")) {
      urls = body.urls as string[];
    }
  } catch {
    // body vacío → lista completa
  }

  try {
    const result = await submitIndexNowUrls(urls);
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error IndexNow";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Usa POST con Authorization Bearer INDEXNOW_SUBMIT_SECRET.",
      keyLocationHint: "https://www.nominapp.xyz/870a5b04203a4c28b8620e87a601845c.txt",
    },
    { status: 405 },
  );
}
