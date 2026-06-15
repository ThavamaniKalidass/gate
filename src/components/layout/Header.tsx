import { Bell, Download, Moon, Sun } from "lucide-react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useClock } from "../../hooks/useClock";
import { useAppStore } from "../../store/AppContext";
import { Button } from "../ui/Button";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";

export function Header({ title }: { title: string }) {
  const clock = useClock();
  const location = useLocation();
  const { darkMode, setDarkMode } = useAppStore();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUserEmail(data.user?.email ?? null);
    }
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription?.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/90 px-3 py-3 backdrop-blur-xl dark:bg-[#0b1310]/90 sm:px-6 lg:px-8 lg:py-4">
      <div className="mx-auto flex max-w-[1540px] items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-normal text-[var(--foreground)] sm:text-2xl">{title}</h1>
          <p className="hidden text-sm text-[var(--muted)] sm:block">Current User: Admin Manager | {clock}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button className="hidden sm:inline-flex" variant="ghost" size="icon" aria-label="Notifications" onClick={() => toast.info("No unread notifications")}>
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Toggle theme" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            variant="primary"
            aria-label="Download PDF"
            onClick={() => {
              if (location.pathname === "/gate-pass") window.dispatchEvent(new Event("gate-pass:export"));
              else toast.info("Open Gate Pass to export the live preview");
            }}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </Button>
          <div className="ml-2">
            {userEmail ? (
              <Button variant="secondary" onClick={async () => { await supabase.auth.signOut(); toast.success("Signed out"); }}>
                {userEmail}
              </Button>
            ) : (
              <Button variant="secondary" onClick={async () => {
                const email = window.prompt("Enter admin email for magic link sign-in:");
                if (!email) return;
                const { error } = await supabase.auth.signInWithOtp({ email });
                if (error) toast.error(error.message);
                else toast.success("Check your email for a sign-in link");
              }}>
                Sign in
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
