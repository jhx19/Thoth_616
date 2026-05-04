import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setPathname } from "@/test/next-mocks";
import AdminApprovePage from "./page";
import type { KnowledgeEntry } from "@/lib/api";

const sampleEntries: KnowledgeEntry[] = [
  {
    entry_id: "ke_aaaa1111",
    sme_id: "sme_3eIv9ONSWB",
    topic: "Restricted Transfer Violations",
    status: "sme_approved",
    content: "Approved content for restricted transfers.",
    sources: { interviews: ["iv_1"], materials: [] },
    created_at: "2026-04-30T10:00:00Z",
    updated_at: "2026-05-01T10:00:00Z",
  },
  {
    entry_id: "ke_bbbb2222",
    sme_id: "sme_3eIv9ONSWB",
    topic: "Compliance Certification Renewals",
    status: "sme_approved",
    content: "Approved content for renewals.",
    sources: { interviews: [], materials: ["mat_x"] },
    created_at: "2026-04-29T10:00:00Z",
    updated_at: "2026-04-30T10:00:00Z",
  },
];

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
  setPathname("/admin/approve");
  fetchMock = vi.fn();
  // Default: list returns sampleEntries
  fetchMock.mockImplementation((url: string) => {
    if (url.includes("/knowledge") && !url.includes("/admin-approve") && !url.includes("/reject")) {
      return Promise.resolve(jsonResponse({ entries: sampleEntries }));
    }
    return Promise.resolve(jsonResponse({}));
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("/admin/approve", () => {
  it("requests only sme_approved entries and renders them", async () => {
    render(<AdminApprovePage />);
    await waitFor(() =>
      expect(screen.getByText("Restricted Transfer Violations")).toBeInTheDocument(),
    );
    expect(screen.getByText("Compliance Certification Renewals")).toBeInTheDocument();

    const calls = fetchMock.mock.calls.map((c) => String(c[0]));
    const listCall = calls.find((u) => u.includes("/knowledge?"));
    expect(listCall, `expected a call to /knowledge?status=sme_approved, got: ${calls.join(", ")}`).toBeDefined();
    expect(listCall).toMatch(/status=sme_approved/);
  });

  it("Approve button POSTs to /knowledge/{id}/admin-approve", async () => {
    const user = userEvent.setup();
    render(<AdminApprovePage />);
    await waitFor(() =>
      expect(screen.getByText("Restricted Transfer Violations")).toBeInTheDocument(),
    );

    const card = screen
      .getByText("Restricted Transfer Violations")
      .closest("article") as HTMLElement;
    await user.click(within(card).getByRole("button", { name: /Approve/i }));

    await waitFor(() => {
      const approveCall = fetchMock.mock.calls.find((c) =>
        String(c[0]).includes("/knowledge/ke_aaaa1111/admin-approve"),
      );
      expect(approveCall, "expected POST /knowledge/{id}/admin-approve").toBeDefined();
      expect(approveCall![1]?.method).toBe("POST");
    });
  });

  it("Reject button expands the comment textarea before confirming", async () => {
    const user = userEvent.setup();
    render(<AdminApprovePage />);
    await waitFor(() =>
      expect(screen.getByText("Restricted Transfer Violations")).toBeInTheDocument(),
    );

    const card = screen
      .getByText("Restricted Transfer Violations")
      .closest("article") as HTMLElement;

    // Initially: no textarea, no Confirm Reject button
    expect(within(card).queryByRole("textbox")).toBeNull();
    expect(within(card).queryByRole("button", { name: /Confirm Reject/i })).toBeNull();

    await user.click(within(card).getByRole("button", { name: /^Reject$/i }));

    // After clicking: textarea + Confirm Reject appear
    expect(within(card).getByRole("textbox")).toBeInTheDocument();
    expect(within(card).getByRole("button", { name: /Confirm Reject/i })).toBeInTheDocument();
  });

  it("admin content area is read-only (no input/textarea for content)", async () => {
    render(<AdminApprovePage />);
    await waitFor(() =>
      expect(screen.getByText("Restricted Transfer Violations")).toBeInTheDocument(),
    );

    const card = screen
      .getByText("Restricted Transfer Violations")
      .closest("article") as HTMLElement;

    // Before clicking Reject, no editable field exists in the card.
    expect(within(card).queryByRole("textbox")).toBeNull();
    expect(card.querySelector("textarea")).toBeNull();
    expect(card.querySelectorAll("input").length).toBe(0);

    // The content text is rendered, but inside a non-editable container.
    const contentNode = within(card).getByText("Approved content for restricted transfers.");
    expect(contentNode.closest("textarea")).toBeNull();
    expect(contentNode.closest("input")).toBeNull();
    // No contentEditable container
    let el: HTMLElement | null = contentNode as HTMLElement;
    while (el && el !== card) {
      expect(el.getAttribute("contenteditable")).not.toBe("true");
      el = el.parentElement;
    }
  });
});
