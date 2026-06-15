import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
  asChild?: boolean;
  children: ReactNode;
}

export function Button({ className, variant = "primary", size = "md", asChild, children, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60",
        "hover:-translate-y-0.5 active:translate-y-0",
        variant === "primary" && "border-transparent bg-[#0f5132] text-white shadow-lg shadow-emerald-950/15 hover:bg-[#0c4329]",
        variant === "secondary" && "border-[var(--border)] bg-white/85 text-[#17211c] shadow-sm hover:bg-white dark:bg-white/10 dark:text-white",
        variant === "ghost" && "border-transparent bg-transparent text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/10",
        variant === "danger" && "border-transparent bg-red-600 text-white hover:bg-red-700",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-4 text-sm",
        size === "icon" && "h-10 w-10 p-0",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
