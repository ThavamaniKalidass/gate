import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Do not throw during build; runtime will catch missing envs.
  console.warn("Missing Supabase environment variables; set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_ANON_KEY ?? "", {
  global: { headers: { "x-application-name": "gate-pass-frontend" } },
});

export async function getCurrentUser() {
  try {
    const resp = await supabase.auth.getUser();
    return resp.data.user ?? null;
  } catch {
    return null;
  }
}
