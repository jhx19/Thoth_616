import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setPathname, pushMock } from "@/test/next-mocks";
import SmeDashboardPage from "./page";

const mockSme = {
  sme_id: "sme_test12345",
  name: "Dr. Elara Voss",
  specialization: "MEZ Trade Compliance",
  sub_areas: ["Restricted commodity transfers"],
  contact_email: "e.voss@mez.org",
  role: "Senior Compliance Officer",
  department: "Legal & Compliance",
  responsible_products: null,
  sub_expertise: null,
  created_at: "2026-04-30T10:00:00Z",
};

const mockKpis = {
  pendingApprovals: 3,
  smesOnboarded: 5,
  approvedEntries: 12,
  escalatedQuestions: 1,
};

const mockInterviews = [
  {
    interview_id: "iv_test_001",
    topic: "Restricted commodity transfers — edge cases",
    requested_by: "Admin · L. Park",
    status: "in_progress",
    created_at: "2026-04-30T14:22:00Z",
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

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  setPathname("/sme/dashboard");
  pushMock.mockClear();
  window.localStorage.setItem("sme_id", mockSme.sme_id);
  window.localStorage.setItem("sme_name", mockSme.name);

  fetchMock = vi.fn().mockImplementation((url: string) => {
    if (url.includes(`/smes/${mockSme.sme_id}/interviews`)) {
      return Promise.resolve(jsonResponse({ interviews: mockInterviews }));
    }
    if (
      url.includes(`/smes/${mockSme.sme_id}`) &&
      !url.includes("/interviews")
    ) {
      return Promise.resolve(jsonResponse(mockSme));
    }
    if (url.includes("/notifications/sme/unread-counts")) {
      return Promise.resolve(jsonResponse({ escalated: 0 }));
    }
    if (url.includes("/knowledge") && !url.includes("/admin")) {
      return Promise.resolve(jsonResponse({ entries: [] }));
    }
    if (url.includes("/admin/dashboard/kpis")) {
      return Promise.resolve(jsonResponse(mockKpis));
    }
    return Promise.resolve(jsonResponse({}));
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

describe("SME interview list (dashboard)", () => {
  it("has no Action column header", async () => {
    render(<SmeDashboardPage />);
    await waitFor(() =>
      expect(screen.getByText(/Welcome back, Dr\. Elara Voss/i)).toBeInTheDocument(),
    );
    const headers = screen
      .getAllByRole("columnheader")
      .map((th) => th.textContent?.trim().toLowerCase() ?? "");
    expect(headers).toEqual(["topic", "requested by", "status", "timestamp"]);
    expect(headers).not.toContain("action");
    expect(headers).not.toContain("actions");
  });

  it("rows are clickable and navigate to the interview", async () => {
    render(<SmeDashboardPage />);
    await waitFor(() =>
      expect(screen.getByText(/Welcome back, Dr\. Elara Voss/i)).toBeInTheDocument(),
    );

    const firstRow = await waitFor(() =>
      screen
        .getByRole("cell", { name: mockInterviews[0].topic })
        .closest("tr") as HTMLTableRowElement,
    );
    expect(firstRow).not.toBeNull();
    expect(firstRow.className).toMatch(/cursor-pointer/);

    fireEvent.click(firstRow);
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        expect.stringMatching(
          new RegExp(
            `^/sme/interview/${mockInterviews[0].interview_id}\\?topic=`,
          ),
        ),
      );
    });

    const tbody = firstRow.parentElement as HTMLTableSectionElement;
    expect(within(tbody).queryByRole("button")).toBeNull();
  });
});
