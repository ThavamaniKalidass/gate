import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CompanySettings, GatePass } from "../types/gate-pass";
import { gatePassService } from "../services/gatePassService";
import { supabase } from "../lib/supabase";

interface AppContextValue {
  passes: GatePass[];
  settings: CompanySettings;
  darkMode: boolean;
  refresh: () => Promise<void>;
  savePass: (pass: GatePass) => Promise<void>;
  deletePass: (id: string) => Promise<void>;
  saveSettings: (settings: CompanySettings) => Promise<void>;
  setDarkMode: (value: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [passes, setPasses] = useState<GatePass[]>([]);
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: "",
    address: { line1: "", city: "", state: "", postalCode: "", country: "" } as any,
    publicUrl: "",
    logo: "/smb-brand-glow.png",
  })
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("gate-pass.theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("gate-pass.theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const refresh = useCallback(async () => {
    const [nextPasses, nextSettings] = await Promise.all([gatePassService.list(), gatePassService.settings()]);
    setPasses(nextPasses);
    setSettings(nextSettings);
  }, []);

  useEffect(() => {
    refresh().catch((error) => console.error(error));
  }, [refresh]);

  useEffect(() => {
    // realtime subscription to gate_passes table
    const channel = supabase
      .channel("public:gate_passes")
      .on("postgres_changes", { event: "*", schema: "public", table: "gate_passes" }, () => {
        refresh().catch((e) => console.error(e));
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh().catch((error) => console.error(error));
      }
    };

    const handleFocus = () => {
      refresh().catch((error) => console.error(error));
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    const intervalId = window.setInterval(() => {
      refresh().catch((error) => console.error(error));
    }, 30000);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.clearInterval(intervalId);
    };
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      passes,
      settings,
      darkMode,
      refresh,
      savePass: async (pass) => {
        await gatePassService.save(pass);
        await refresh();
      },
      deletePass: async (id) => {
        await gatePassService.remove(id);
        await refresh();
      },
      saveSettings: async (nextSettings) => {
        setSettings(nextSettings);
        const saved = await gatePassService.saveSettings(nextSettings);
        setSettings(saved);
      },
      setDarkMode,
    }),
    [darkMode, passes, settings],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppStore must be used inside AppProvider");
  }
  return context;
}
