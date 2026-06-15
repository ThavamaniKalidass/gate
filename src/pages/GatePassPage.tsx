import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { GatePassForm } from "../components/gate-pass/GatePassForm";
import { GatePassPreview } from "../components/gate-pass/GatePassPreview";
import { Card, CardHeader } from "../components/ui/Card";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";
import { useAppStore } from "../store/AppContext";
import type { GatePass } from "../types/gate-pass";
import { exportElementToPdf } from "../utils/pdf";
export function GatePassPage() {
  const { settings, savePass } = useAppStore();
  const [preview, setPreview] = useState<Partial<GatePass>>({});

  const exportPdf = useCallback(async () => {
    try {
      let passToExport: GatePass | Partial<GatePass> = preview;

      passToExport = preview;

      await exportElementToPdf("gate-pass-preview", `${passToExport.gatePassNumber || "gate-pass"}.pdf`);
      toast.success("PDF exported successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "PDF export failed");
    }
  }, [preview, savePass, settings]);

  useKeyboardShortcut("p", exportPdf);

  useEffect(() => {
    window.addEventListener("gate-pass:export", exportPdf);
    return () => window.removeEventListener("gate-pass:export", exportPdf);
  }, [exportPdf]);

  return (
    <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)]">
      <motion.div className="min-w-0" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <GatePassForm onPreviewChange={setPreview} />
      </motion.div>
      <motion.div className="min-w-0 2xl:sticky 2xl:top-28 2xl:self-start" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
        <Card className="overflow-hidden p-3 sm:p-4">
          <CardHeader title="Live Gate Pass Preview" description="A4 printable rendering updates as the form changes." />
          <GatePassPreview pass={preview} settings={settings} />
        </Card>
      </motion.div>
    </div>
  );
}
