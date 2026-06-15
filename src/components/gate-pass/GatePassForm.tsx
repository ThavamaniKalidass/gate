import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus, RefreshCcw, Save, Trash2 } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { gatePassService } from "../../services/gatePassService";
import { useAppStore } from "../../store/AppContext";
import { brandOptions, departments, deviceTypes, type GatePass } from "../../types/gate-pass";
import { readFileAsDataUrl } from "../../utils/file";
import { emptyItem, generateGatePassNumber, getQrPayload } from "../../utils/gatePass";
import { gatePassSchema, type GatePassFormValues } from "../../validation/gatePassSchema";
import { Button } from "../ui/Button";
import { Card, CardHeader } from "../ui/Card";
import { FieldError, Input, Label, Select } from "../ui/Form";

const defaultValues = (): GatePassFormValues => ({
  gatePassType: "Returnable",
  gatePassNumber: gatePassService.nextNumber(),
  employeeName: "",
  employeeId: "",
  department: "IT",
  date: format(new Date(), "yyyy-MM-dd"),
  preparedTime: format(new Date(), "HH:mm"), 
  fromLocation: "",
  toLocation: "",
  items: [emptyItem()],
  approvals: {
    preparedByName: "",
    preparedByDepartment: "IT",
    securityInCharge: "",
    receiverName: "",
    receiverPhone: "",
    receiverSignature: "",
  },
});

export function GatePassForm({ onPreviewChange }: { onPreviewChange: (pass: Partial<GatePass>) => void }) {
  const { savePass, settings, passes } = useAppStore();
  const draft = gatePassService.draft();
  const manualGatePassNumber = useRef(false);
  const defaultGatePassNumber = useMemo(() => generateGatePassNumber(passes.length + 1), [passes]);

  const form = useForm<GatePassFormValues>({
    resolver: zodResolver(gatePassSchema),
    defaultValues: {
      ...defaultValues(),
      ...draft,
      approvals: {
        ...defaultValues().approvals,
        ...draft?.approvals,
        preparedByDepartment: "IT",
      },
    } as GatePassFormValues,
    mode: "onBlur",
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  useEffect(() => {
    const subscription = form.watch(async (value) => {
      gatePassService.saveDraft(value as Partial<GatePass>);
      const qrCode = await QRCode.toDataURL(getQrPayload({ ...(value as Partial<GatePass>), status: "Draft" }, settings), {
        width: 180,
        margin: 1,
        color: { dark: "#0f5132", light: "#ffffff" },
      });
      onPreviewChange({ ...(value as Partial<GatePass>), qrCode, status: "Draft" });
    });
    return () => subscription.unsubscribe();
  }, [form, onPreviewChange, settings]);

  useEffect(() => {
    if (!draft && !manualGatePassNumber.current) {
      form.setValue("gatePassNumber", defaultGatePassNumber);
    }
  }, [defaultGatePassNumber, draft, form]);

  useEffect(() => {
    form.trigger();
  }, [form]);

  async function onSubmit(values: GatePassFormValues) {
    const now = new Date().toISOString();
    const passWithoutQr: GatePass = {
      ...values,
      id: crypto.randomUUID(),
      status: "Printed",
      createdAt: now,
      updatedAt: now,
    };
    const qrCode = await QRCode.toDataURL(getQrPayload(passWithoutQr, settings), { width: 320, margin: 2 });
    const pass: GatePass = { ...passWithoutQr, qrCode };
    await savePass(pass);
    gatePassService.clearDraft();
    toast.success("Gate pass saved to print history");
  }

  function startNewGatePass() {
    gatePassService.clearDraft();
    const nextValues = defaultValues();
    form.reset(nextValues);
    onPreviewChange(nextValues);
    toast.success("Ready for next gate pass");
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title="Gate Pass Details" description="Primary movement information and employee ownership." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Gate Pass Type" error={form.formState.errors.gatePassType?.message}>
            <Select {...form.register("gatePassType")}>
              <option>Returnable</option>
              <option>Non Returnable</option>
            </Select>
          </Field>
          <Field label="Gate Pass Number" error={form.formState.errors.gatePassNumber?.message}>
            <Input
              placeholder="GP/YYYY/MM/0001"
              {...form.register("gatePassNumber", {
                onChange: () => {
                  manualGatePassNumber.current = true;
                },
              })}
            />
          </Field>
          <Field label="Employee Name" error={form.formState.errors.employeeName?.message}>
            <Input placeholder="Enter employee name" {...form.register("employeeName")} />
          </Field>
          <Field label="Employee ID" error={form.formState.errors.employeeId?.message}>
            <Input inputMode="numeric" placeholder="Numeric ID" {...form.register("employeeId")} />
          </Field>
          <Field label="Department" error={form.formState.errors.department?.message}>
            <Select {...form.register("department")}>
              {departments.map((department) => (
                <option key={department}>{department}</option>
              ))}
            </Select>
          </Field>
          <Field label="Date" error={form.formState.errors.date?.message}>
            <Input type="date" {...form.register("date")} />
          </Field>
          <Field label="Pass Prepared Time" error={form.formState.errors.preparedTime?.message}>
            <Input type="time" {...form.register("preparedTime")} />
          </Field>
          <Field label="From Location" error={form.formState.errors.fromLocation?.message}>
            <Input placeholder="Warehouse A" {...form.register("fromLocation")} />
          </Field>
          <Field label="To Location" error={form.formState.errors.toLocation?.message}>
            <Input placeholder="Client site" {...form.register("toLocation")} />
          </Field>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <CardHeader title="Items / Articles" description="Add each asset, article, or device moving through security." />
          <Button type="button" variant="secondary" onClick={() => append(emptyItem())}>
            <Plus className="h-4 w-4" />
            Add Row
          </Button>
        </div>
        <div className="max-w-full overflow-x-auto">
          <table className="item-entry-table w-full min-w-[980px] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-[var(--muted)]">
                {["S.No", "Serial Number", "Brand", "Device Type", "Quantity", "Remarks", ""].map((head) => (
                  <th key={head} className="px-2 py-1 font-semibold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id} className="rounded-xl bg-white/70 shadow-sm dark:bg-white/5">
                  <td data-label="S.No" className="px-2 py-2 font-semibold">{index + 1}</td>
                  <td data-label="Serial Number" className="px-2 py-2"><Input {...form.register(`items.${index}.serialNumber`)} /></td>
                  <td data-label="Brand" className="px-2 py-2">
                    <Select {...form.register(`items.${index}.brand`)}>
                      <option value="">Select brand</option>
                      {brandOptions.map((brand) => (
                        <option key={brand}>{brand}</option>
                      ))}
                    </Select>
                  </td>
                  <td data-label="Device Type" className="px-2 py-2">
                    <Select {...form.register(`items.${index}.deviceType`)}>
                      <option value="">Select device</option>
                      {deviceTypes.map((deviceType) => (
                        <option key={deviceType}>{deviceType}</option>
                      ))}
                    </Select>
                  </td>
                  <td data-label="Quantity" className="px-2 py-2"><Input type="number" min={1} {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} /></td>
                  <td data-label="Remarks" className="px-2 py-2"><Input {...form.register(`items.${index}.remarks`)} /></td>
                  <td data-label="Action" className="px-2 py-2">
                    <Button type="button" variant="ghost" size="icon" aria-label="Delete row" disabled={fields.length === 1} onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Approval Details" description="Prepared by, security, receiver, and signature." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Prepared By Name" error={form.formState.errors.approvals?.preparedByName?.message}>
            <Input {...form.register("approvals.preparedByName")} />
          </Field>
          <Field label="Prepared By Department" error={form.formState.errors.approvals?.preparedByDepartment?.message}>
            <Input readOnly {...form.register("approvals.preparedByDepartment")} />
          </Field>
          <Field label="Security In Charge" error={form.formState.errors.approvals?.securityInCharge?.message}>
            <Input {...form.register("approvals.securityInCharge")} />
          </Field>
          <Field label="Receiver Name" error={form.formState.errors.approvals?.receiverName?.message}>
            <Input {...form.register("approvals.receiverName")} />
          </Field>
          <Field label="Phone Number" error={form.formState.errors.approvals?.receiverPhone?.message}>
            <Input inputMode="numeric" maxLength={10} {...form.register("approvals.receiverPhone")} />
          </Field>
          <Controller
            control={form.control}
            name="approvals.receiverSignature"
            render={({ field }) => (
              <Field label="Signature Upload">
                <Input type="file" accept="image/*" onChange={async (event) => field.onChange(event.target.files?.[0] ? await readFileAsDataUrl(event.target.files[0]) : "")} />
              </Field>
            )}
          />
        </div>
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="secondary" onClick={startNewGatePass}>
          <RefreshCcw className="h-4 w-4" />
          New Gate Pass
        </Button>
        <Button type="button" variant="secondary" onClick={() => toast.success("Draft autosaved locally")}>
          Autosave Active
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          <Save className="h-4 w-4" />
          Save Gate Pass
        </Button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}
