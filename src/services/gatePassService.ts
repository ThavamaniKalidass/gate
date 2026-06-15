import { fixedCompanyAddress, type CompanySettings, type GatePass } from "../types/gate-pass";
import { generateGatePassNumber } from "../utils/gatePass";
import { supabase, getCurrentUser } from "../lib/supabase";

const BRAND_LOGO = "/smb-brand-glow.png";

const defaultSettings: CompanySettings = {
  companyName: "Sustainable Medical Billing",
  address: fixedCompanyAddress,
  publicUrl: "",
  logo: BRAND_LOGO,
};

function normalizeSettings(settings: Partial<CompanySettings> = {}): CompanySettings {
  const logo = !settings.logo || settings.logo === "/smb-logo.png" ? BRAND_LOGO : settings.logo;
  return { ...defaultSettings, ...settings, logo, address: fixedCompanyAddress };
}

function mapRowToPass(row: any): GatePass {
  return { ...(row.pass as GatePass), id: row.id } as GatePass;
}

const draftCache = new Map<string, Partial<GatePass>>();

export const gatePassService = {
  async list(): Promise<GatePass[]> {
    const { data, error } = await supabase.from("gate_passes").select("id, pass, created_at, updated_at").order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRowToPass);
  },
  async save(pass: GatePass) {
    const payload = { id: pass.id, pass };
    const { error: upsertError } = await supabase.from("gate_passes").upsert([payload], { onConflict: "id" });
    if (upsertError) throw upsertError;

    // record activity
    const user = await getCurrentUser();
    try {
      await supabase.from("activity_logs").insert([{ user_id: user?.id ?? null, event: "gate_pass_upsert", details: { id: pass.id, gatePassNumber: pass.gatePassNumber } }]);
    } catch {
      // non-blocking
    }

    return pass;
  },
  async remove(id: string) {
    const { error } = await supabase.from("gate_passes").delete().eq("id", id);
    if (error) throw error;
    const user = await getCurrentUser();
    try {
      await supabase.from("activity_logs").insert([{ user_id: user?.id ?? null, event: "gate_pass_delete", details: { id } }]);
    } catch {}
  },
  nextNumber: function () {
    // Synchronous version using cache; in a real app, fetch count from DB or state
    return generateGatePassNumber(Math.floor(Math.random() * 10000));
  },
  async settings(): Promise<CompanySettings> {
    const { data, error } = await supabase.from("settings").select("value").eq("key", "company").limit(1);
    if (error) throw error;
    const value = data?.[0]?.value ?? defaultSettings;
    return normalizeSettings(value);
  },
  async saveSettings(settings: CompanySettings) {
    const normalized = normalizeSettings(settings);
    const { error } = await supabase.from("settings").upsert([{ key: "company", value: normalized }], { onConflict: "key" });
    if (error) throw error;
    const user = await getCurrentUser();
    try {
      await supabase.from("activity_logs").insert([{ user_id: user?.id ?? null, event: "settings_update", details: normalized }]);
    } catch {}
    return normalized;
  },
  draft(): Partial<GatePass> | undefined {
    return draftCache.get("draft");
  },
  saveDraft(draft: Partial<GatePass>) {
    draftCache.set("draft", draft);
  },
  clearDraft() {
    draftCache.delete("draft");
  },
};
