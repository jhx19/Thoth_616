import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setPathname } from "@/test/next-mocks";
import ChatPage from "./page";

// Helpers to find specific bubbles in the seeded sampleChat.
function findAnswerBubble() {
  return screen.getByText(/Under MCC Article 14, a restricted transfer violation/i);
}
function findClarificationBubble() {
  return screen.getByText(/Could you clarify which area you mean/i);
}
function findRoutingBubble() {
  return screen.getByText(/I don't have this in my approved knowledge base yet/i);
}

describe("User chat", () => {
  beforeEach(() => setPathname("/"));

  it("answer bubble shows the source citation card", () => {
    render(<ChatPage />);
    const answer = findAnswerBubble();
    const wrapper = answer.parentElement?.parentElement as HTMLElement;
    expect(within(wrapper).getByText(/Vendor_Compliance_Guide\.pdf/i)).toBeInTheDocument();
    expect(within(wrapper).getByText(/Approved by Dr\. Elara Voss/i)).toBeInTheDocument();
    expect(within(wrapper).getByText(/Last Reviewed: Apr 2026/i)).toBeInTheDocument();
  });

  it("clarification bubble shows category chips", () => {
    render(<ChatPage />);
    const clar = findClarificationBubble();
    const wrapper = clar.parentElement?.parentElement as HTMLElement;
    expect(within(wrapper).getByRole("button", { name: "Trade Compliance" })).toBeInTheDocument();
    expect(within(wrapper).getByRole("button", { name: "Digital Assets" })).toBeInTheDocument();
    expect(within(wrapper).getByRole("button", { name: "Dispute Resolution" })).toBeInTheDocument();
  });

  it('routing bubble shows "Ask this SME directly" button', () => {
    render(<ChatPage />);
    const routing = findRoutingBubble();
    const wrapper = routing.parentElement?.parentElement as HTMLElement;
    expect(
      within(wrapper).getByRole("button", { name: /Ask this SME directly/i }),
    ).toBeInTheDocument();
  });

  it("New Chat button generates a new session_id", async () => {
    const user = userEvent.setup();
    const { container } = render(<ChatPage />);

    const before = container.querySelector("[data-session-id]")?.getAttribute("data-session-id") ?? null;
    await user.click(screen.getByRole("button", { name: /New Chat/i }));
    const after = container.querySelector("[data-session-id]")?.getAttribute("data-session-id") ?? null;

    expect(
      after,
      "expected New Chat to surface a session_id (e.g. via data-session-id) — none was found",
    ).not.toBeNull();
    expect(after).not.toBe(before);
    // Session id should look like a real id, not an empty string
    expect(after).toMatch(/.+/);
  });
});
