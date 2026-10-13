import { NextRequest, NextResponse } from "next/server";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Sister sites hosted elsewhere (SRAM on GitHub Pages) post here from the
// browser with their own `source`. Only these origins get CORS headers.
const ALLOWED_ORIGINS = new Set([
  "https://semicentric.github.io",
  "https://sram.build",
  "https://www.sram.build",
  ...(process.env.WAITLIST_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
]);

function cors(req: NextRequest): Record<string, string> {
  const origin = req.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: cors(req) });
}

export async function POST(req: NextRequest) {
  const headers = cors(req);
  try {
    const { email, source } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400, headers },
      );
    }

    await pool.query(
      "INSERT INTO waitlist (email, source) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING",
      [email, source || "semicentric"],
    );

    return NextResponse.json({ ok: true }, { headers });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500, headers },
    );
  }
}
