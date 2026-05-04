import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-input border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-muted",
      "focus:outline-none focus:ring-2 focus:ring-magenta/30 focus:border-magenta",
      "resize-none",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
