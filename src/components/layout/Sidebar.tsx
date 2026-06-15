import { ClipboardList, FileClock, LayoutDashboard, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";

const menu = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Gate Pass", href: "/gate-pass", icon: ClipboardList },
  { label: "Print History", href: "/history", icon: FileClock },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="relative z-40 border-b border-white/10 bg-[var(--sidebar)] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 px-4 py-3 lg:px-6 lg:py-7">
          <div className="grid h-11 w-16 shrink-0 place-items-center rounded-xl bg-white/10 p-1 shadow-inner lg:h-14 lg:w-20">
            <img src="/smb-brand-glow.png" alt="Sustainable Medical Billing logo" className="max-h-full max-w-full rounded-lg object-contain" />
          </div>
          <div>
            <p className="hidden text-sm text-emerald-100/80 sm:block">Office Logo</p>
            <h1 className="text-sm font-semibold leading-snug sm:text-base">Sustainable Medical Billing</h1>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-3 pb-3 [scrollbar-width:none] lg:flex-1 lg:flex-col lg:overflow-visible lg:px-4 [&::-webkit-scrollbar]:hidden">
          {menu.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex min-w-max items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-emerald-50/75 transition sm:gap-3 sm:px-4 sm:py-3 sm:text-sm",
                  "hover:bg-white/10 hover:text-white",
                  isActive && "bg-white text-[#0f5132] shadow-lg shadow-black/20",
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <footer className="hidden border-t border-white/10 px-6 py-5 text-xs text-emerald-50/60 lg:block">
          <p>© 2026 SMB</p>
          <p className="mt-1">Enterprise Gate Pass Suite</p>
        </footer>
      </div>
    </aside>
  );
}
