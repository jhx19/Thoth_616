import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setPathname } from "@/test/next-mocks";
import ChatPage from "./page";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "ERR",
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

function mockQueryResponse(body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse(body));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  setPathname("/");
  window.localStorage.clear();
});
afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

async function sendQuestion(question: string) {
  const user = userEvent.setup();
  const textarea = screen.getByPlaceholderText(/Ask about MEZ/i);
  await user.type(textarea, question);
  await user.click(screen.getByRole("button", { name: /Send/i }));
}

describe("User chat", () => {
  it("answer bubble shows the source citation card", async () => {
    mockQueryResponse({
      type: "answer",
      content:
        "Under MCC Article 14, a restricted transfer violation requires four elements.",
      source: {
        title: "Vendor_Compliance_Guide.pdf",
        approved_by: "Dr. Elara Voss",
        reviewed: "Apr 2026",
      },
    });

    render(<ChatPage />);
    await waitFor(() =>
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument(),
    );
    await sendQuestion("article 14 elements?");

    const answer = await screen.findByText(
      /Under MCC Article 14, a restricted transfer violation/i,
    );
    const wrapper = answer.parentElement?.parentElement as HTMLElement;
    expect(
      within(wrapper).getByText(/Vendor_Compliance_Guide\.pdf/i),
    ).toBeInTheDocument();
    expect(
      within(wrapper).getByText(/Approved by Dr\. Elara Voss/i),
    ).toBeInTheDocument();
    expect(
      within(wrapper).getByText(/Last Reviewed: Apr 2026/i),
    ).toBeInTheDocument();
  });

  it("clarification bubble shows category chips", async () => {
    mockQueryResponse({
      type: "clarification",
      content: "Could you clarify which area you mean?",
      chips: ["Trade Compliance", "Digital Assets", "Dispute Resolution"],
    });

    render(<ChatPage />);
    await waitFor(() =>
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument(),
    );
    await sendQuestion("compliance requirements?");

    const clar = await screen.findByText(/Could you clarify which area you mean/i);
    const wrapper = clar.parentElement?.parentElement as HTMLElement;
    expect(
      within(wrapper).getByRole("button", { name: "Trade Compliance" }),
    ).toBeInTheDocument();
    expect(
      within(wrapper).getByRole("button", { name: "Digital Assets" }),
    ).toBeInTheDocument();
    expect(
      within(wrapper).getByRole("button", { name: "Dispute Resolution" }),
    ).toBeInTheDocument();
  });

  it('routing bubble shows "Ask this SME directly" button', async () => {
    mockQueryResponse({
      type: "routing",
      content:
        "I don't have this in my approved knowledge base yet. I recommend reaching the following SME directly:",
      smes: [
        {
          name: "Dr. Nadia Okafor",
          specialization: "MEZ Dispute Resolution",
          reason: "Tribunal filing falls under Articles 42-48",
          email: "n.okafor@mez.org",
        },
      ],
    });

    render(<ChatPage />);
    await waitFor(() =>
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument(),
    );
    await sendQuestion("how do I file with the MEZ Tribunal?");

    const routing = await screen.findByText(
      /I don't have this in my approved knowledge base yet/i,
    );
    const wrapper = routing.parentElement?.parentElement as HTMLElement;
    expect(
      within(wrapper).getByRole("button", { name: /Ask this SME directly/i }),
    ).toBeInTheDocument();
  });

  it("New Chat button generates a new session_id", async () => {
    mockQueryResponse({});
    const user = userEvent.setup();
    const { container } = render(<ChatPage />);
    await waitFor(() =>
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument(),
    );

    const before =
      container.querySelector("[data-session-id]")?.getAttribute("data-session-id") ??
      null;
    await user.click(
      screen.getByRole("button", { name: /Start new chat conversation/i }),
    );
    await waitFor(() => {
      const after =
        container
          .querySelector("[data-session-id]")
          ?.getAttribute("data-session-id") ?? null;
      expect(after).not.toBeNull();
      expect(after).not.toBe(before);
      expect(after).toMatch(/.+/);
    });
  });
});
