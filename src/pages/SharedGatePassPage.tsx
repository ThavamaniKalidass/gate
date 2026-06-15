import { AlertCircle, BadgeCheck } from "lucide-react";
import { GatePassPreview } from "../components/gate-pass/GatePassPreview";
import { readSharedGatePass } from "../utils/gatePass";

export function SharedGatePassPage() {
  const shared = readSharedGatePass(window.location.hash);

  if (!shared) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-4">
        <section className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-xl">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Invalid Gate Pass QR</h1>
          <p className="mt-2 text-sm text-slate-600">QR code data is missing or damaged. Please scan the latest generated QR code.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-2 py-4 sm:px-4">
      <div className="mx-auto mb-4 flex max-w-[794px] items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
        <BadgeCheck className="h-6 w-6 shrink-0" />
        <div>
          <p className="font-semibold">Gate Pass Details</p>
          <p className="text-xs">Displayed directly from the scanned QR code.</p>
        </div>
      </div>
      <div className="mx-auto max-w-[850px]">
        <GatePassPreview pass={shared.pass} settings={shared.settings} />
      </div>
    </main>
  );
}
