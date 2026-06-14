import { NextResponse } from "next/server";

const MANIFEST_URL =
  "https://raw.githubusercontent.com/K4MIKAZ3/NominaCO-Pro/main/web/public/version.json";

export async function GET() {
  try {
    const response = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ error: "Manifiesto no disponible." }, { status: 502 });
    }
    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ error: "No se pudo leer la versión." }, { status: 502 });
  }
}
