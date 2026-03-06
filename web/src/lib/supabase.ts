import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

function isLikelySupabaseUrl(url?: string) {
  if (!url) return false;

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "https:" && parsedUrl.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

function isLikelySupabaseClientKey(key?: string) {
  if (!key) return false;

  if (key.startsWith("sb_publishable_")) {
    return key.length >= 30;
  }

  const segments = key.split(".");
  return key.startsWith("eyJ") && segments.length === 3;
}

export const isSupabaseConfigured =
  isLikelySupabaseUrl(supabaseUrl) && isLikelySupabaseClientKey(supabaseAnonKey);
export const supabase =
  isSupabaseConfigured && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

function requireSupabaseClient() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or VITE_SUPABASE_ANON_KEY)."
    );
  }
  return supabase;
}

// Helper functions for common operations
export const supabaseAuth = {
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) =>
    requireSupabaseClient().auth.signUp({
      email,
      password,
      options: metadata ? { data: metadata } : undefined
    }),

  signIn: (email: string, password: string) =>
    requireSupabaseClient().auth.signInWithPassword({ email, password }),

  signOut: () => requireSupabaseClient().auth.signOut(),

  getCurrentUser: () => requireSupabaseClient().auth.getUser(),

  getSession: () => requireSupabaseClient().auth.getSession()
};

export type ProfileRow = {
  id: string;
  role: "player" | "parent" | "coach" | "recruiter";
  linked_user_id: string;
};

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await requireSupabaseClient()
    .from("profiles")
    .select("id, role, linked_user_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;

  return (data as ProfileRow | null) ?? null;
}

export async function upsertProfile(profile: ProfileRow): Promise<ProfileRow> {
  const { data, error } = await requireSupabaseClient()
    .from("profiles")
    .upsert(profile)
    .select("id, role, linked_user_id")
    .single();

  if (error) throw error;

  return data as ProfileRow;
}
