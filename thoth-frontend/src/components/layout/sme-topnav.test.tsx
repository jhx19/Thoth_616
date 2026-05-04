import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { setPathname } from "@/test/next-mocks";
import { SmeTopNav } from "./sme-topnav";

describe("SmeTopNav", () => {
  beforeEach(() => setPathname("/sme/dashboard"));

  it("renders all 4 nav links", () => {
    render(<SmeTopNav />);
    const nav = screen.getByRole("navigation");
    expect(within(nav).getByRole("link", { name: /Dashboard/i })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: /Interviews/i })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: /Knowledge Approval/i })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: /Escalated Questions/i })).toBeInTheDocument();
    expect(within(nav).getAllByRole("link")).toHaveLength(4);
  });

  it("active link has magenta underline", () => {
    setPathname("/sme/dashboard");
    const { container } = render(<SmeTopNav />);
    const dashboard = screen.getByRole("link", { name: /Dashboard/i });
    expect(dashboard.className).toMatch(/text-magenta/);
    const underline = dashboard.querySelector("span.bg-magenta");
    expect(underline).not.toBeNull();
    expect(underline?.className).toMatch(/h-\[2px\]/);

    const interviews = screen.getByRole("link", { name: /Interviews/i });
    expect(interviews.className).not.toMatch(/text-magenta/);
    expect(container.querySelectorAll("a span.bg-magenta.h-\\[2px\\]")).toHaveLength(1);
  });

  it("does not show count badges on Escalated Questions (design spec)", () => {
    render(<SmeTopNav />);
    const escalated = screen.getByRole("link", { name: /Escalated Questions/i });
    expect(
      escalated.querySelector('[aria-label*="unanswered"]'),
    ).toBeNull();
  });
});
