import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setPathname } from "@/test/next-mocks";
import SmeKnowledgePage from "./page";

const smeId = "sme_test12345";

const mockEntries = [
  {
    entry_id: "ke_001",
    sme_id: smeId,
    topic: "Vendor Compliance Escalations",
    status: "draft",
    content: "Draft content",
    sources: { interviews: [], materials: [] },
    created_at: "2026-04-28T10:00:00Z",
    updated_at: "2026-04-28T10:00:00Z",
  },
  {
    entry_id: "ke_002",
    sme_id: smeId,
    topic: "Dispute Filing Procedures",
    status: "rejected",
    content: "Rejected content",
    sources: { interviews: [], materials: [] },
    created_at: "2026-04-25T10:00:00Z",
    updated_at: "2026-04-26T10:00:00Z",
  },
];

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
  setPathname("/sme/knowledge");
  window.localStorage.setItem("sme_id", smeId);

  const fetchMock = vi.fn().mockImplementation((url: string) => {
    if (url.includes("/knowledge") && !url.includes("/admin")) {
      return Promise.resolve(jsonResponse({ entries: mockEntries }));
    }
    return Promise.resolve(jsonResponse({}));
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe("SME knowledge approval editor", () => {
  it("renders pending entries from the API", async () => {
    render(<SmeKnowledgePage />);
    await waitFor(() =>
      expect(
        screen.getByText(/Vendor Compliance Escalations/i),
      ).toBeInTheDocument(),
    );
  });

  it("can switch active entry by clicking its sidebar button", async () => {
    const user = userEvent.setup();
    render(<SmeKnowledgePage />);

    await waitFor(() =>
      expect(
        screen.getByText(/Dispute Filing Procedures/i),
      ).toBeInTheDocument(),
    );

    const button = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.includes("Dispute Filing Procedures"));
    expect(button).toBeDefined();
    await user.click(button!);

    // Header reflects newly selected entry
    const heading = await screen.findByRole("heading", {
      name: /Dispute Filing Procedures/i,
    });
    expect(heading).toBeInTheDocument();
  });
});
