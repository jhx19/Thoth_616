// Same-origin pass-through to the backend so the browser never crosses
// origins (no CORS). Configurable via:
//   API_BASE_URL        — upstream /api/v1 base (default http://localhost:8000/api/v1)
//   API_UPSTREAM_ROOT   — app root for /interviews/* (default http://localhost:8000)
//   BENCHMARK_API_KEY   — bearer token (default thoth-secret-2026)
// All are server-side env vars (no NEXT_PUBLIC_ prefix).

// Most Thoth REST routes live under /api/v1. The interview router is mounted at
// /interviews/* on the FastAPI app root (see backend app/main.py).
const UPSTREAM_API_V1 =
  process.env.API_BASE_URL || "http://localhost:8000/api/v1";
const UPSTREAM_ROOT =
  process.env.API_UPSTREAM_ROOT || "http://localhost:8000";
const UPSTREAM_TOKEN =
  process.env.BENCHMARK_API_KEY || "thoth-secret-2026";

export const dynamic = "force-dynamic";

type RouteCtx = { params: { path: string[] } };

function upstreamBaseForSegments(segments: string[]): string {
  if (segments[0] === "interviews") {
    return UPSTREAM_ROOT;
  }
  return UPSTREAM_API_V1;
}

async function forward(request: Request, segments: string[]): Promise<Response> {
  const incoming = new URL(request.url);
  const base = upstreamBaseForSegments(segments);
  const target = new URL(`${base}/${segments.join("/")}`);
  incoming.searchParams.forEach((v, k) => target.searchParams.set(k, v));

  const headers = new Headers();
  const ct = request.headers.get("content-type");
  if (ct) headers.set("Content-Type", ct);
  headers.set("Authorization", `Bearer ${UPSTREAM_TOKEN}`);

  const method = request.method.toUpperCase();
  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const text = await request.text();
    body = text.length > 0 ? text : undefined;
  }

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      method,
      headers,
      body,
      cache: "no-store",
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown";
    return new Response(
      JSON.stringify({ detail: `Proxy upstream unreachable: ${detail}` }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  const responseHeaders = new Headers();
  const responseCT = upstream.headers.get("content-type");
  if (responseCT) responseHeaders.set("Content-Type", responseCT);
  const responseBody = await upstream.text();
  return new Response(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(request: Request, ctx: RouteCtx) {
  return forward(request, ctx.params.path);
}
export async function POST(request: Request, ctx: RouteCtx) {
  return forward(request, ctx.params.path);
}
export async function PUT(request: Request, ctx: RouteCtx) {
  return forward(request, ctx.params.path);
}
export async function DELETE(request: Request, ctx: RouteCtx) {
  return forward(request, ctx.params.path);
}
export async function PATCH(request: Request, ctx: RouteCtx) {
  return forward(request, ctx.params.path);
}
