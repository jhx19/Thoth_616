import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom doesn't implement Element.scrollTo / scrollIntoView; stub as no-ops
// so components that auto-scroll on mount don't crash during render.
if (typeof Element !== "undefined") {
  if (!Element.prototype.scrollTo) {
    Element.prototype.scrollTo = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// Quiet the noisy `act()` warning for client components that
// kick off effects we don't await — tests still assert observable state.
const origError = console.error;
console.error = (...args: unknown[]) => {
  const msg = String(args[0] ?? "");
  if (msg.includes("not wrapped in act(")) return;
  origError(...(args as []));
};
