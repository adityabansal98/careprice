import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "info" | "secondary";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
        {
          "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300":
            variant === "default",
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300":
            variant === "success",
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300":
            variant === "warning",
          "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300":
            variant === "info",
          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300":
            variant === "secondary",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };

