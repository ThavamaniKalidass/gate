import { Save, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { Input, Label, Textarea } from "../components/ui/Form";
import { useAppStore } from "../store/AppContext";
import { fixedCompanyAddress, type CompanySettings } from "../types/gate-pass";
import { readFileAsDataUrl } from "../utils/file";

export function SettingsPage() {
  const { settings, saveSettings } = useAppStore();
  const [form, setForm] = useState<CompanySettings>(settings);

  async function updateImage(key: keyof CompanySettings, file?: File) {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setForm((value) => ({ ...value, [key]: dataUrl }));
  }

  function submit() {
    saveSettings({ ...form, address: fixedCompanyAddress });
    toast.success("Company settings saved");
  }

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader title="Company Settings" description="Manage organization identity used in printable gate passes." />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Company Name</Label>
            <Input value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Textarea readOnly value={fixedCompanyAddress} />
          </div>
          <div className="md:col-span-2">
            <Label>Public App URL for QR Scanning</Label>
            <Input
              type="url"
              placeholder="https://your-public-app-link.example"
              value={form.publicUrl ?? ""}
              onChange={(event) => setForm({ ...form, publicUrl: event.target.value })}
            />
            <p className="mt-1 text-xs text-[var(--muted)]">Required when generating QR codes from localhost. Scanned devices open this public link.</p>
          </div>
          <UploadField label="Logo" onChange={(file) => updateImage("logo", file)} />
          <UploadField label="Authorized Signature" onChange={(file) => updateImage("authorizedSignature", file)} />
        </div>
        <div className="mt-5">
          <Button onClick={submit}><Save className="h-4 w-4" />Save Settings</Button>
        </div>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader title="Brand Preview" />
        <div className="space-y-4">
          <PreviewImage label="Logo" src={form.logo} />
          <PreviewImage label="Authorized Signature" src={form.authorizedSignature} />
        </div>
      </Card>
    </div>
  );
}

function UploadField({ label, onChange }: { label: string; onChange: (file?: File) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input type="file" accept="image/*" onChange={(event) => onChange(event.target.files?.[0])} />
        <Upload className="h-5 w-5 text-[var(--muted)]" />
      </div>
    </div>
  );
}

function PreviewImage({ label, src, round }: { label: string; src?: string; round?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className={`flex h-32 max-w-full items-center justify-center overflow-hidden border border-[var(--border)] bg-white/70 p-3 ${round ? "mx-auto w-32 rounded-full" : "w-full rounded-xl"}`}>
        {src ? <img src={src} alt={label} className={`block max-h-full max-w-full object-contain ${round ? "rounded-full" : "rounded-lg"}`} /> : <span className="text-sm text-[var(--muted)]">Not uploaded</span>}
      </div>
    </div>
  );
}
