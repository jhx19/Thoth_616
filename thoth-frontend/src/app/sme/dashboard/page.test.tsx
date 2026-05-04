import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setPathname, pushMock } from "@/test/next-mocks";
import SmeDashboardPage from "./page";
import { smeInterviews } from "@/lib/mock-data";

describe("SME interview list (dashboard)", () => {
  beforeEach(() => {
    setPathname("/sme/dashboard");
    pushMock.mockClear();
  });

  it("has no Action column header", () => {
    render(<SmeDashboardPage />);
    const headers = screen
      .getAllByRole("columnheader")
      .map((th) => th.textContent?.trim().toLowerCase() ?? "");
    expect(headers).toEqual(["topic", "requested by", "status", "timestamp"]);
    expect(headers).not.toContain("action");
    expect(headers).not.toContain("actions");
  });

  it("rows are clickable and navigate to the interview", async () => {
    const user = userEvent.setup();
    render(<SmeDashboardPage />);
    const firstRow = screen
      .getByRole("cell", { name: smeInterviews[0].topic })
      .closest("tr") as HTMLTableRowElement;
    expect(firstRow).not.toBeNull();
    expect(firstRow.className).toMatch(/cursor-pointer/);

    await user.click(firstRow);
    expect(pushMock).toHaveBeenCalledWith(`/sme/interview/${smeInterviews[0].id}`);

    // No Action button cells in the rows
    const tbody = firstRow.parentElement as HTMLTableSectionElement;
    expect(within(tbody).queryByRole("button")).toBeNull();
  });
});
