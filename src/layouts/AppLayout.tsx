import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Sidebar } from "../components/layout/Sidebar";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/gate-pass": "Gate Pass",
  "/history": "Print History",
  "/settings": "Settings",
};

export function AppLayout() {
  const location = useLocation();
  const title = titles[location.pathname] ?? "Gate Pass Management";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />
      <div className="min-w-0 min-h-screen lg:pl-72">
        <Header title={title} />
        <main className="mx-auto min-w-0 w-full max-w-[1540px] px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
