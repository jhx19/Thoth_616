// Shared mocks for Next.js navigation primitives used across page tests.
import { vi } from "vitest";

export const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => globalThis.__TEST_PATHNAME__ ?? "/",
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

declare global {
  // eslint-disable-next-line no-var
  var __TEST_PATHNAME__: string | undefined;
}

export function setPathname(p: string) {
  globalThis.__TEST_PATHNAME__ = p;
}
