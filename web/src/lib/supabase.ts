import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

function requireSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return supabase;
}

// Helper functions for common operations
export const supabaseAuth = {
  signUp: (email: string, password: string) =>
    requireSupabaseClient().auth.signUp({ email, password }),

  signIn: (email: string, password: string) =>
    requireSupabaseClient().auth.signInWithPassword({ email, password }),

  signOut: () => requireSupabaseClient().auth.signOut(),

  getCurrentUser: () => requireSupabaseClient().auth.getUser(),

  getSession: () => requireSupabaseClient().auth.getSession()
};
