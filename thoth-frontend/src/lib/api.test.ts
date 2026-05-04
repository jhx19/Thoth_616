import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// We re-import api.ts inside each test after stubbing env, since BASE_URL
// is read at module-load time.
let fetchMock: ReturnType<typeof vi.fn>;

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "ERR",
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(jsonResponse({ entries: [] }));
  vi.stubGlobal("fetch", fetchMock);
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("api client", () => {
  it("includes Authorization: Bearer header on every request", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000/api/v1");
    vi.stubEnv("NEXT_PUBLIC_BENCHMARK_API_KEY", "thoth-secret-2026");
    const api = await import("./api");

    await api.listKnowledge({ status: "sme_approved" });
    await api.adminApproveKnowledge("ke_xyz");
    await api.rejectKnowledge("ke_xyz", "needs more detail");
    await api.getSme("sme_3eIv9ONSWB");
    await api.createInterview("sme_3eIv9ONSWB");
    await api.addInterviewTurn("iv_abc", { answer: "ok" });

    expect(fetchMock).toHaveBeenCalledTimes(6);
    for (const call of fetchMock.mock.calls) {
      const init = call[1] as RequestInit;
      const headers = init.headers as Record<string, string>;
      expect(headers, `missing headers on ${call[0]}`).toBeDefined();
      expect(headers.Authorization).toBe("Bearer thoth-secret-2026");
    }
  });

  it("uses NEXT_PUBLIC_API_BASE_URL as the base URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://example.test/api/v1");
    vi.stubEnv("NEXT_PUBLIC_BENCHMARK_API_KEY", "k");
    const api = await import("./api");

    await api.listKnowledge({ status: "sme_approved" });
    await api.getSme("sme_3eIv9ONSWB");
    await api.adminApproveKnowledge("ke_aaa");

    const urls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(urls[0]).toBe("https://example.test/api/v1/knowledge?status=sme_approved");
    expect(urls[1]).toBe("https://example.test/api/v1/smes/sme_3eIv9ONSWB");
    expect(urls[2]).toBe("https://example.test/api/v1/knowledge/ke_aaa/admin-approve");
  });

  it("falls back to http://localhost:8000/api/v1 when env var is unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_BENCHMARK_API_KEY", "k");
    const api = await import("./api");
    await api.listKnowledge();
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url.startsWith("http://localhost:8000/api/v1")).toBe(true);
  });
});
