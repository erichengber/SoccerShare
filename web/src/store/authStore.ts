import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { UserRole } from "@/types/domain";

interface AuthMetadata {
  selected_role?: UserRole;
  selected_user_id?: string | null;
}

interface AuthState {
  isInitialized: boolean;
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  selectedRole?: UserRole;
  selectedUserId?: string;
  error?: string;
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<string | undefined>;
  signUpWithEmail: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ) => Promise<string | undefined>;
  selectRole: (role: UserRole) => Promise<string | undefined>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

function parseRoleFromMetadata(user: User | null): UserRole | undefined {
  const role = (user?.user_metadata as AuthMetadata | undefined)?.selected_role;
  return role === "player" ||
    role === "parent" ||
    role === "coach" ||
    role === "recruiter"
    ? role
    : undefined;
}

function parseUserIdFromMetadata(user: User | null, selectedRole?: UserRole): string | undefined {
  // Backward compatibility: keep reading legacy selected_user_id if present.
  const userId = (user?.user_metadata as AuthMetadata | undefined)
    ?.selected_user_id;
  if (typeof userId === "string" && userId.length > 0) return userId;

  // Non-demo flow: role-scoped pages use the authenticated user id.
  if (selectedRole && user?.id) return user.id;

  return undefined;
}

function parseMetadataOverride(metadata?: Record<string, unknown>): { selectedRole?: UserRole } {
  const selectedRole = metadata?.selected_role;

  return {
    selectedRole:
      selectedRole === "player" ||
      selectedRole === "parent" ||
      selectedRole === "coach" ||
      selectedRole === "recruiter"
        ? selectedRole
        : undefined,
  };
}

export const useAuthStore = create<AuthState>((set, get) => {
  let hasListener = false;

  function requireSupabaseForAuth() {
    if (!isSupabaseConfigured || !supabase) {
      return "Authentication is unavailable because Supabase environment variables are not configured.";
    }

    return undefined;
  }

  function getSupabaseClient() {
    const configurationError = requireSupabaseForAuth();
    if (configurationError || !supabase) {
      return { client: null, error: configurationError };
    }

    return { client: supabase, error: undefined };
  }

  const applySession = (session: Session | null) => {
    const user = session?.user ?? null;
    const selectedRole = parseRoleFromMetadata(user);
    set({
      user,
      session,
      selectedRole,
      selectedUserId: parseUserIdFromMetadata(user, selectedRole),
    });
  };

  return {
    isInitialized: false,
    isLoading: false,
    user: null,
    session: null,
    selectedRole: undefined,
    selectedUserId: undefined,
    error: undefined,

    initialize: async () => {
      if (get().isInitialized) return;

      set({ isLoading: true, error: undefined });
      const configurationError = requireSupabaseForAuth();
      if (configurationError) {
        set({
          isInitialized: true,
          isLoading: false,
          user: null,
          session: null,
          selectedRole: undefined,
          selectedUserId: undefined,
          error: undefined,
        });
        return;
      }

      const { client } = getSupabaseClient();
      if (!client) {
        set({ isInitialized: true, isLoading: false });
        return;
      }

      const { data, error } = await client.auth.getSession();
      if (error) {
        set({ error: error.message });
      }

      applySession(data.session);

      if (!hasListener) {
        hasListener = true;
        client.auth.onAuthStateChange((_event, nextSession) => {
          applySession(nextSession);
        });
      }

      set({ isInitialized: true, isLoading: false });
    },

    signInWithEmail: async (email: string, password: string) => {
      set({ isLoading: true, error: undefined });
      const configurationError = requireSupabaseForAuth();
      if (configurationError) {
        set({ isLoading: false, error: configurationError });
        return configurationError;
      }

      const { client } = getSupabaseClient();
      if (!client) {
        set({ isLoading: false });
        return configurationError;
      }

      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (data.session) {
        applySession(data.session);
      }
      set({ isLoading: false, error: error?.message });
      return error?.message;
    },

    signUpWithEmail: async (email: string, password: string, metadata?: Record<string, unknown>) => {
      set({ isLoading: true, error: undefined });
      const configurationError = requireSupabaseForAuth();
      if (configurationError) {
        set({ isLoading: false, error: configurationError });
        return configurationError;
      }

      const { client } = getSupabaseClient();
      if (!client) {
        set({ isLoading: false });
        return configurationError;
      }

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: metadata ? { data: metadata } : undefined,
      });
      const metadataOverride = parseMetadataOverride(metadata);
      if (data.session) {
        applySession(data.session);
        set((state) => ({
          selectedRole: state.selectedRole ?? metadataOverride.selectedRole,
          selectedUserId: state.selectedUserId ?? data.session?.user.id,
        }));
      }
      set({ isLoading: false, error: error?.message });
      return error?.message;
    },

    selectRole: async (role: UserRole) => {
      const configurationError = requireSupabaseForAuth();
      if (configurationError) {
        set({ error: configurationError });
        return configurationError;
      }

      const { client } = getSupabaseClient();
      if (!client) {
        set({ error: configurationError });
        return configurationError;
      }

      const { user } = get();
      if (!user) {
        const message = "You must sign in before selecting a role.";
        set({ error: message });
        return message;
      }

      set({ isLoading: true, error: undefined });
      const { data, error } = await client.auth.updateUser({
        data: {
          ...(user.user_metadata ?? {}),
          selected_role: role,
          selected_user_id: null,
        },
      });

      if (error) {
        set({ isLoading: false, error: error.message });
        return error.message;
      }

      set({
        user: data.user,
        selectedRole: role,
        selectedUserId: data.user.id,
        isLoading: false,
      });
      return undefined;
    },

    signOut: async () => {
      set({ isLoading: true, error: undefined });
      const configurationError = requireSupabaseForAuth();
      if (configurationError) {
        applySession(null);
        set({ isLoading: false });
        return;
      }

      const { client } = getSupabaseClient();
      if (!client) {
        applySession(null);
        set({ isLoading: false });
        return;
      }

      const { error } = await client.auth.signOut();
      if (error) {
        set({ isLoading: false, error: error.message });
        return;
      }

      applySession(null);
      set({ isLoading: false });
    },

    clearError: () => set({ error: undefined }),
  };
});
