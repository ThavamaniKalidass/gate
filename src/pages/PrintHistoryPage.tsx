import * as Dialog from "@radix-ui/react-dialog";
import { Download, Eye, Printer, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { GatePassPreview } from "../components/gate-pass/GatePassPreview";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Form";
import { useAppStore } from "../store/AppContext";
import { departments, type GatePass } from "../types/gate-pass";
import { exportElementToPdf } from "../utils/pdf";

type PendingAction = "download" | "print" | null;

export function PrintHistoryPage() {
  const { passes, deletePass, settings } = useAppStore();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All");
  const [page, setPage] = useState(1);
  const [selectedPass, setSelectedPass] = useState<GatePass | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const pageSize = 8;

  const filtered = useMemo(() => {
    return passes
      .filter((pass) => [pass.gatePassNumber, pass.employeeName, pass.department].join(" ").toLowerCase().includes(query.toLowerCase()))
      .filter((pass) => department === "All" || pass.department === department)
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }, [department, passes, query]);
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (!selectedPass || !previewOpen || !pendingAction) return;

    const timer = window.setTimeout(async () => {
      try {
        if (pendingAction === "download") {
          await exportElementToPdf("gate-pass-preview", selectedPass.gatePassNumber || "gate-pass");
          toast.success("PDF downloaded");
        } else {
          window.print();
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Action failed");
      } finally {
        setPendingAction(null);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [pendingAction, previewOpen, selectedPass]);

  function openPreview(pass: GatePass) {
    setSelectedPass(pass);
    setPreviewOpen(true);
  }

  function runAction(pass: GatePass, action: PendingAction) {
    setSelectedPass(pass);
    setPreviewOpen(true);
    setPendingAction(action);
  }

  async function handleDelete(id: string) {
    try {
      await deletePass(id);
      toast.success("Record deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  return (
    <>
      <Card>
        <CardHeader title="Print History" description="Search, filter, sort, paginate, and manage generated gate passes." />
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-[var(--muted)]" />
            <Input className="pl-10" placeholder="Search by gate pass, employee, or department" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <Select value={department} onChange={(event) => setDepartment(event.target.value)}>
            <option>All</option>
            {departments.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs uppercase text-[var(--muted)]">
              <tr><th className="py-3">Gate Pass No</th><th>Employee Name</th><th>Department</th><th>Date</th><th>Time</th><th>Status</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody>
              {pageItems.map((pass) => (
                <tr key={pass.id} className="border-t border-[var(--border)]">
                  <td className="py-3 font-semibold">{pass.gatePassNumber}</td>
                  <td>{pass.employeeName}</td>
                  <td>{pass.department}</td>
                  <td>{pass.date}</td>
                  <td>{pass.preparedTime || "-"}</td>
                  <td><Badge>{pass.status}</Badge></td>
                  <td className="flex justify-end gap-2 py-2">
                    <Button variant="ghost" size="icon" aria-label="View" onClick={() => openPreview(pass)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" aria-label="Download PDF" onClick={() => runAction(pass, "download")}><Download className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" aria-label="Print" onClick={() => runAction(pass, "print")}><Printer className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => handleDelete(pass.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                  </td>
                </tr>
              ))}
              {!pageItems.length && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--muted)]">No gate passes found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-[var(--muted)]">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</Button>
            <Button variant="secondary" size="sm" disabled={page === pages} onClick={() => setPage((value) => value + 1)}>Next</Button>
          </div>
        </div>
      </Card>

      <Dialog.Root open={previewOpen} onOpenChange={setPreviewOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/45" />
          <Dialog.Content className="fixed inset-x-3 top-4 z-50 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl bg-white p-3 shadow-2xl outline-none sm:inset-x-8 sm:p-5 dark:bg-[#101c17]">
            <div className="mx-auto mb-3 flex max-w-[794px] items-center justify-between gap-3">
              <Dialog.Title className="text-lg font-bold text-[var(--foreground)]">{selectedPass?.gatePassNumber || "Gate Pass Preview"}</Dialog.Title>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => selectedPass && runAction(selectedPass, "download")}><Download className="h-4 w-4" />PDF</Button>
                <Button variant="secondary" size="sm" onClick={() => selectedPass && runAction(selectedPass, "print")}><Printer className="h-4 w-4" />Print</Button>
                <Dialog.Close asChild>
                  <Button variant="ghost" size="sm">Close</Button>
                </Dialog.Close>
              </div>
            </div>
            {selectedPass && <GatePassPreview pass={selectedPass} settings={settings} />}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
