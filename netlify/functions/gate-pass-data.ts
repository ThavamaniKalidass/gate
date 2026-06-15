import { createClient } from "@supabase/supabase-js";
import type { CompanySettings, GatePass } from "../../src/types/gate-pass";
import { fixedCompanyAddress } from "../../src/types/gate-pass";

const BRAND_LOGO = "/smb-brand-glow.png";

const defaultSettings: CompanySettings = {
  companyName: "Sustainable Medical Billing",
  address: fixedCompanyAddress,
  publicUrl: "",
  logo: BRAND_LOGO,
};

interface GatePassState {
  passes: GatePass[];
  settings: CompanySettings;
}

const jsonHeaders = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

function normalizeState(state?: Partial<GatePassState> | null): GatePassState {
  const settings = state?.settings ?? {};
  const logo = !settings.logo || settings.logo === "/smb-logo.png" ? BRAND_LOGO : settings.logo;

  return {
    passes: Array.isArray(state?.passes) ? state.passes : [],
    settings: { ...defaultSettings, ...settings, logo, address: fixedCompanyAddress },
  };
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { ...jsonHeaders, ...init?.headers },
  });
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
let supabase: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!supabase) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error("Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in Netlify environment variables.");
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { global: { headers: { "x-application-name": "gate-pass" } } });
  }
  return supabase;
}

export default async function handler(request: Request) {
  try {
    const client = getClient();

    if (request.method === "GET") {
      const { data: passesData, error: passError } = await client.from("gate_passes").select("pass").order("created_at", { ascending: false });
      if (passError) throw passError;
      const passes = (passesData || []).map((r: any) => r.pass as GatePass);

      const { data: settingsData, error: settingsError } = await client.from("settings").select("value").limit(1);
      if (settingsError) throw settingsError;
      const settings = settingsData?.[0]?.value ?? defaultSettings;

      return json({ passes, settings });
    }

    const body = await request.json().catch(() => ({}));

    if (request.method === "POST") {
      const pass = body.pass as GatePass | undefined;
      if (!pass?.id) return json({ error: "Missing gate pass" }, { status: 400 });

      const { error: upsertError } = await client.from("gate_passes").upsert([{ id: pass.id, pass }], { onConflict: "id" });
      if (upsertError) throw upsertError;

      // record activity log (optional user id in header or body)
      const userId = request.headers.get("x-user-id") ?? body.userId ?? null;
      await client.from("activity_logs").insert([{ user_id: userId, event: "gate_pass_upsert", details: { id: pass.id, gatePassNumber: pass.gatePassNumber } }]);

      const { data: passesData, error: passError } = await client.from("gate_passes").select("pass").order("created_at", { ascending: false });
      if (passError) throw passError;
      const passes = (passesData || []).map((r: any) => r.pass as GatePass);

      return json({ passes, pass });
    }

    if (request.method === "DELETE") {
      const id = body.id as string | undefined;
      if (!id) return json({ error: "Missing gate pass id" }, { status: 400 });

      const { error: deleteError } = await client.from("gate_passes").delete().eq("id", id);
      if (deleteError) throw deleteError;
      const userId = request.headers.get("x-user-id") ?? body.userId ?? null;
      await client.from("activity_logs").insert([{ user_id: userId, event: "gate_pass_delete", details: { id } }]);

      const { data: passesData, error: passError } = await client.from("gate_passes").select("pass").order("created_at", { ascending: false });
      if (passError) throw passError;
      const passes = (passesData || []).map((r: any) => r.pass as GatePass);

      return json({ passes });
    }

    if (request.method === "PUT") {
      const settings = body.settings as CompanySettings | undefined;
      if (!settings) return json({ error: "Missing settings" }, { status: 400 });

      const { error: upsertError } = await client.from("settings").upsert([{ key: "company", value: settings }], { onConflict: "key" });
      if (upsertError) throw upsertError;
      const userId = request.headers.get("x-user-id") ?? body.userId ?? null;
      await client.from("activity_logs").insert([{ user_id: userId, event: "settings_update", details: settings }]);

      const { data: settingsData, error: settingsError } = await client.from("settings").select("value").limit(1);
      if (settingsError) throw settingsError;
      const saved = settingsData?.[0]?.value ?? defaultSettings;

      return json({ settings: saved });
    }

    return json({ error: "Method not allowed" }, { status: 405 });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown sync error" }, { status: 500 });
  }
}
