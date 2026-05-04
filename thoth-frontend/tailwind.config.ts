import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        magenta: { DEFAULT: "#E20074", 50: "#FFF0F8" },
        ink: "#1A1A1A",
        muted: "#6B7280",
        page: "#F9FAFB",
        card: "#FFFFFF",
        line: "#E5E7EB",
        status: {
          "draft-bg": "#F3F4F6",
          "draft-fg": "#6B7280",
          "in-progress-bg": "#FEF3C7",
          "in-progress-fg": "#92400E",
          "sme-approved-bg": "#DBEAFE",
          "sme-approved-fg": "#1E40AF",
          "approved-bg": "#D1FAE5",
          "approved-fg": "#065F46",
          "rejected-bg": "#FEE2E2",
          "rejected-fg": "#991B1B",
          "completed-bg": "#D1FAE5",
          "completed-fg": "#065F46",
        },
        bubble: {
          "ai-bg": "#F3F4F6",
          "ai-fg": "#1A1A1A",
          "sme-bg": "#EDE9FE",
          "sme-fg": "#4C1D95",
          "admin-bg": "#FEF3C7",
          "admin-fg": "#78350F",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "8px",
        badge: "6px",
        input: "4px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
