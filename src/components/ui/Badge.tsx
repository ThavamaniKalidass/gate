import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-[#0f5132]", className)}>
      {children}
    </span>
  );
}
