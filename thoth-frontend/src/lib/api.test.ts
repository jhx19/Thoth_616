import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

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
});

describe("api client", () => {
  it("sends requests to /api/proxy/* (same-origin; no browser bearer)", async () => {
    const api = await import("./api");
    await api.listKnowledge({ status: "sme_approved" });
    await api.getSme("sme_3eIv9ONSWB");
    await api.adminApproveKnowledge("ke_aaa");
    await api.rejectKnowledge("ke_bbb", "needs more detail");
    await api.createSme({
      name: "Test",
      specialization: "Test",
      sub_areas: ["a"],
      contact_email: "t@t.org",
    });
    await api.getDashboardKpis();

    const urls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(urls[0]).toBe("/api/proxy/knowledge?status=sme_approved");
    expect(urls[1]).toBe("/api/proxy/smes/sme_3eIv9ONSWB");
    expect(urls[2]).toBe("/api/proxy/knowledge/ke_aaa/admin-approve");
    expect(urls[3]).toBe("/api/proxy/knowledge/ke_bbb/reject");
    expect(urls[4]).toBe("/api/proxy/smes");
    expect(urls[5]).toBe("/api/proxy/admin/dashboard/kpis");

    for (const call of fetchMock.mock.calls) {
      const init = call[1] as RequestInit | undefined;
      const headers = init?.headers as Record<string, string> | undefined;
      expect(headers?.Authorization, `unexpected Authorization on ${call[0]}`).toBeUndefined();
    }
  });

  it("forwards JSON bodies for POST/PUT requests", async () => {
    const api = await import("./api");
    await api.rejectKnowledge("ke_aaa", "missing context");
    await api.createSme({
      name: "Dr. Test",
      specialization: "MEZ",
      sub_areas: ["x", "y"],
      contact_email: "test@example.com",
      role: "Lead",
    });

    const rejectInit = fetchMock.mock.calls[0][1] as RequestInit;
    expect(rejectInit.method).toBe("POST");
    expect(rejectInit.body).toBe(JSON.stringify({ reason: "missing context" }));

    const createInit = fetchMock.mock.calls[1][1] as RequestInit;
    expect(createInit.method).toBe("POST");
    expect(createInit.body).toBe(
      JSON.stringify({
        name: "Dr. Test",
        specialization: "MEZ",
        sub_areas: ["x", "y"],
        contact_email: "test@example.com",
        role: "Lead",
      }),
    );
  });
});
