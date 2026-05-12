import ws from "ws";
import { createClient } from "@supabase/supabase-js";

// Node 20 has no native WebSocket — polyfill it for the Supabase realtime client
if (!globalThis.WebSocket) {
  (globalThis as any).WebSocket = ws;
}

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface SupabaseUserClaims {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
  };
}

export async function verifySupabaseToken(accessToken: string): Promise<SupabaseUserClaims> {
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new Error(error?.message || "Invalid Supabase token");
  }
  return data.user as SupabaseUserClaims;
}
