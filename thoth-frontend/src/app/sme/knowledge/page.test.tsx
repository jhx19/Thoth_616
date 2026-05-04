import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setPathname } from "@/test/next-mocks";
import SmeKnowledgePage from "./page";
import { smePendingKnowledge } from "@/lib/mock-data";

describe("SME knowledge approval editor — rejection comment visibility", () => {
  beforeEach(() => setPathname("/sme/knowledge"));

  it("hides rejection comment when active entry is not rejected", () => {
    render(<SmeKnowledgePage />);
    // The first pending entry is "draft" (status != rejected) by fixture.
    const first = smePendingKnowledge[0];
    expect(first.status).not.toBe("rejected");
    expect(screen.queryByText(/Rejected by Admin/i)).toBeNull();
    expect(screen.queryByText(/Comment:/i)).toBeNull();
  });

  it("shows rejection comment after switching to a rejected entry", async () => {
    const user = userEvent.setup();
    render(<SmeKnowledgePage />);

    const rejected = smePendingKnowledge.find((e) => e.status === "rejected");
    expect(rejected).toBeDefined();

    // Click the matching button in the left list (first match wins; topic is unique).
    const button = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.includes(rejected!.topic));
    expect(button).toBeDefined();
    await user.click(button!);

    expect(screen.getByText(/Rejected by Admin/i)).toBeInTheDocument();
    expect(screen.getByText(/Comment:/i)).toBeInTheDocument();
    expect(screen.getByText(rejected!.rejectionComment!)).toBeInTheDocument();
  });
});
