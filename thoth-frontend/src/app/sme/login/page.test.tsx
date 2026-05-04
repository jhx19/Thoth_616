import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setPathname } from "@/test/next-mocks";
import SmeLoginPage from "./page";

describe("/sme/login", () => {
  beforeEach(() => setPathname("/sme/login"));

  it("renders both Login and Register tabs", () => {
    render(<SmeLoginPage />);
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument();
  });

  describe("Register form", () => {
    it("validates required fields on submit", async () => {
      const user = userEvent.setup();
      render(<SmeLoginPage />);

      await user.click(screen.getByRole("button", { name: "Register" }));
      await user.click(screen.getByRole("button", { name: /Submit/i }));

      expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Specialization is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Add at least one sub expertise/i)).toBeInTheDocument();
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    });
  });
});
