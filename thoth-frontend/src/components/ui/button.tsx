"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-input text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-magenta text-white hover:bg-[#c50068]",
        secondary: "bg-card text-ink border border-line hover:bg-[#F9FAFB]",
        danger: "bg-card text-[#EF4444] border border-[#EF4444] hover:bg-[#FEF2F2]",
        approve: "bg-[#059669] text-white hover:bg-[#047857]",
        ghost: "bg-transparent text-ink hover:bg-[#F3F4F6]",
        chip: "bg-card text-ink border border-line hover:bg-magenta hover:text-white hover:border-magenta",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-5 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
