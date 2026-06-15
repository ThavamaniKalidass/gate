import { format } from "date-fns";
import { fixedCompanyAddress, fixedCompanyAddressTitle, type CompanySettings, type GatePass } from "../../types/gate-pass";

export function GatePassPreview({ pass, settings }: { pass: Partial<GatePass>; settings: CompanySettings }) {
  const items = pass.items?.length ? pass.items : [];
  const approvals = pass.approvals;

  return (
    <div className="overflow-hidden rounded-xl bg-slate-100 p-1.5 dark:bg-black/20 sm:p-3">
      <article id="gate-pass-preview" className="print-a4 relative mx-auto overflow-hidden rounded-xl border border-slate-200 p-4 shadow-2xl sm:p-8">
        <header className="pdf-header relative z-10 flex flex-col gap-4 border-b-4 border-[#0f5132] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="pdf-brand flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="pdf-logo grid h-16 w-40 place-items-center rounded-xl border border-emerald-100 bg-[#061a3f] p-2 text-xl font-bold text-[#0f5132] sm:h-20 sm:w-52">
              {settings.logo ? <img src={settings.logo} alt="Company logo" className="h-full w-full rounded-lg object-contain" /> : "GP"}
            </div>
            <div className="pdf-brand-copy">
              <h2 className="text-xl font-bold text-[#0f5132] sm:text-2xl">{settings.companyName}</h2>
              <AddressText address={settings.address || fixedCompanyAddress} />
            </div>
          </div>
          {pass.qrCode && <img src={pass.qrCode} alt="Gate pass QR code" className="pdf-qr h-20 w-20 self-end sm:h-24 sm:w-24" />}
        </header>

        <h1 className="relative z-10 my-5 text-center text-2xl font-black tracking-[0.14em] text-slate-900 sm:my-6 sm:text-3xl sm:tracking-[0.2em]">GATE PASS</h1>

        <section className="relative z-10 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-emerald-50/80 p-4 text-sm">
          <Info label="Gate Pass No" value={pass.gatePassNumber} />
          <Info label="Type" value={pass.gatePassType} />
          <Info label="Date" value={pass.date ? format(new Date(pass.date), "dd MMM yyyy") : ""} />
          <Info label="Pass Prepared Time" value={pass.preparedTime} />
          <Info label="Status" value={pass.status ?? "Draft"} />
          <Info label="From Location" value={pass.fromLocation} />
          <Info label="To Location" value={pass.toLocation} />
        </section>

        <section className="pdf-employee-row relative z-10 mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <Info label="Employee Name" value={pass.employeeName} />
          <Info label="Employee ID" value={pass.employeeId} />
          <Info label="Department" value={pass.department} />
        </section>

        <section className="relative z-10 mt-7">
          <h3 className="mb-3 text-sm font-bold uppercase text-[#0f5132]">Items / Articles</h3>
          <div className="max-w-full overflow-x-auto">
          <table className="w-full border-collapse text-left text-[10px] sm:text-xs">
            <thead>
              <tr className="bg-[#0f5132] text-white">
                {["S.No", "Serial Number", "Brand", "Device Type", "Qty", "Remarks"].map((head) => (
                  <th key={head} className="border border-[#0f5132] px-2 py-2 font-semibold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td className="border border-slate-300 px-2 py-2">{index + 1}</td>
                  <td className="border border-slate-300 px-2 py-2">{item.serialNumber}</td>
                  <td className="border border-slate-300 px-2 py-2">{item.brand}</td>
                  <td className="border border-slate-300 px-2 py-2">{item.deviceType}</td>
                  <td className="border border-slate-300 px-2 py-2">{item.quantity}</td>
                  <td className="border border-slate-300 px-2 py-2">{item.remarks}</td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td className="border border-slate-300 px-2 py-6 text-center text-slate-500" colSpan={6}>
                    No items added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </section>

        <section className="relative z-10 mt-7 rounded-xl border border-slate-200 bg-white/70 p-4 text-sm">
          <p className="font-semibold text-slate-900">Note: This Gate Pass valid up to 24 Hours only</p>
          <p className="mt-2 font-semibold text-slate-900">Pass Prepared Time: {pass.preparedTime || "-"}</p>
        </section>

        <footer className="relative z-10 mt-10 grid grid-cols-3 gap-4 text-center text-xs">
          <Signature label="Prepared By" name={approvals?.preparedByName} />
          <Signature label="Security In Charge" name={approvals?.securityInCharge} />
          <div>
            <div className="mx-auto mb-2 flex h-20 items-end justify-center border-b border-slate-400">
              {approvals?.receiverSignature && <img src={approvals.receiverSignature} alt="Receiver signature" className="max-h-16 object-contain" />}
            </div>
            <p className="font-semibold">Receiver Signature</p>
            <p className="mt-1 text-slate-500">{approvals?.receiverName}</p>
          </div>
        </footer>

        <div className="pdf-bottom-row relative z-10 mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-xs text-slate-500">Generated by GateOps Enterprise - API-ready local record</div>
        </div>
      </article>
    </div>
  );
}

function AddressText({ address }: { address?: any }) {
  const addressText =
    typeof address === "string"
      ? address
      : fixedCompanyAddress;

  if (!addressText) {
    return (
      <p className="mt-1 max-w-md text-sm text-slate-600">
        {fixedCompanyAddress}
      </p>
    );
  }

  if (!addressText.includes(fixedCompanyAddressTitle)) {
    return (
      <p className="mt-1 max-w-md text-sm text-slate-600">
        {addressText}
      </p>
    );
  }

  const parts = addressText.split(fixedCompanyAddressTitle);
  const before = parts[0] ?? "";
  const after = parts[1] ?? "";

  return (
    <p className="mt-1 max-w-md text-sm text-slate-600">
      {before}
      <strong>{fixedCompanyAddressTitle}</strong>
      {after}
    </p>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 min-h-5 font-semibold text-slate-900">{value || "-"}</p>
    </div>
  );
}

function Signature({ label, name }: { label: string; name?: string }) {
  return (
    <div>
      <div className="mb-2 h-20 border-b border-slate-400" />
      <p className="font-semibold">{label}</p>
      <p className="mt-1 text-slate-500">{name || "-"}</p>
    </div>
  );
}
