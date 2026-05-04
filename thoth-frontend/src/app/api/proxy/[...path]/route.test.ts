import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { GET, POST, PUT } from "./route";

let upstreamFetch: ReturnType<typeof vi.fn>;

function upstreamResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  upstreamFetch = vi.fn();
  vi.stubGlobal("fetch", upstreamFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("/api/proxy/[...path] route", () => {
  it("GET forwards path + query and injects Bearer token", async () => {
    upstreamFetch.mockResolvedValue(upstreamResponse({ smes: [] }));
    const req = new Request(
      "http://localhost:3000/api/proxy/knowledge?status=sme_approved",
    );
    const res = await GET(req, { params: { path: ["knowledge"] } });

    expect(res.status).toBe(200);
    const [url, init] = upstreamFetch.mock.calls[0];
    expect(String(url)).toBe(
      "http://localhost:8000/api/v1/knowledge?status=sme_approved",
    );
    expect((init.headers as Headers).get("Authorization")).toBe(
      "Bearer thoth-secret-2026",
    );
    expect(init.method).toBe("GET");
  });

  it("POST forwards JSON body to upstream and returns its status", async () => {
    upstreamFetch.mockResolvedValue(upstreamResponse({ sme_id: "sme_xxx" }, 201));
    const payload = JSON.stringify({ name: "Test", specialization: "MEZ" });
    const req = new Request("http://localhost:3000/api/proxy/smes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });
    const res = await POST(req, { params: { path: ["smes"] } });

    expect(res.status).toBe(201);
    const [url, init] = upstreamFetch.mock.calls[0];
    expect(String(url)).toBe("http://localhost:8000/api/v1/smes");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(payload);
    expect((init.headers as Headers).get("Authorization")).toBe(
      "Bearer thoth-secret-2026",
    );
    expect((init.headers as Headers).get("Content-Type")).toBe(
      "application/json",
    );
  });

  it("PUT forwards nested path segments correctly", async () => {
    upstreamFetch.mockResolvedValue(upstreamResponse({ entry_id: "ke_aaa" }));
    const req = new Request("http://localhost:3000/api/proxy/knowledge/ke_aaa", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "updated" }),
    });
    const res = await PUT(req, { params: { path: ["knowledge", "ke_aaa"] } });

    expect(res.status).toBe(200);
    const [url, init] = upstreamFetch.mock.calls[0];
    expect(String(url)).toBe("http://localhost:8000/api/v1/knowledge/ke_aaa");
    expect(init.method).toBe("PUT");
  });

  it("GET /interviews/* uses API_UPSTREAM_ROOT (not /api/v1)", async () => {
    upstreamFetch.mockResolvedValue(
      upstreamResponse({
        topic_index: 0,
        turn_number: 1,
        last_question: "Hello?",
      }),
    );
    const req = new Request(
      "http://localhost:3000/api/proxy/interviews/int_abc/resume",
    );
    const res = await GET(req, {
      params: { path: ["interviews", "int_abc", "resume"] },
    });

    expect(res.status).toBe(200);
    const [url, init] = upstreamFetch.mock.calls[0];
    expect(String(url)).toBe(
      "http://localhost:8000/interviews/int_abc/resume",
    );
    expect((init.headers as Headers).get("Authorization")).toBe(
      "Bearer thoth-secret-2026",
    );
  });

  it("returns 502 when upstream is unreachable", async () => {
    upstreamFetch.mockRejectedValue(new Error("ECONNREFUSED"));
    const req = new Request("http://localhost:3000/api/proxy/health");
    const res = await GET(req, { params: { path: ["health"] } });

    expect(res.status).toBe(502);
    const body = (await res.json()) as { detail: string };
    expect(body.detail).toMatch(/Proxy upstream unreachable/);
    expect(body.detail).toMatch(/ECONNREFUSED/);
  });
});
