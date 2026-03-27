import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import type { UserRole } from "@/types/domain";

type AuthMetadata = {
  selected_role?: UserRole;
  selected_user_id?: string;
};

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
  selectRole: (role: UserRole, userId: string) => Promise<string | undefined>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

function parseRoleFromMetadata(user: User | null): UserRole | undefined {
  const role = (user?.user_metadata as AuthMetadata | undefined)?.selected_role;
  return role === "player" || role === "parent" || role === "coach" || role === "recruiter"
    ? role
    : undefined;
}

function parseUserIdFromMetadata(user: User | null): string | undefined {
  const userId = (user?.user_metadata as AuthMetadata | undefined)?.selected_user_id;
  return typeof userId === "string" && userId.length > 0 ? userId : undefined;
}

function parseMetadataOverride(
  metadata?: Record<string, unknown>
): { selectedRole?: UserRole; selectedUserId?: string } {
  const selectedRole = metadata?.selected_role;
  const selectedUserId = metadata?.selected_user_id;

  return {
    selectedRole:
      selectedRole === "player" || selectedRole === "parent" || selectedRole === "coach" || selectedRole === "recruiter"
        ? selectedRole
        : undefined,
    selectedUserId: typeof selectedUserId === "string" && selectedUserId.length > 0 ? selectedUserId : undefined
  };
}

export const useAuthStore = create<AuthState>((set, get) => {
  let hasListener = false;

  const applySession = (session: Session | null) => {
    const user = session?.user ?? null;
    set({
      user,
      session,
      selectedRole: parseRoleFromMetadata(user),
      selectedUserId: parseUserIdFromMetadata(user)
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
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        set({ error: error.message });
      }

      applySession(data.session);

      if (!hasListener) {
        hasListener = true;
        supabase.auth.onAuthStateChange((_event, nextSession) => {
          applySession(nextSession);
        });
      }

      set({ isInitialized: true, isLoading: false });
    },

    signInWithEmail: async (email, password) => {
      set({ isLoading: true, error: undefined });
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (data.session) {
        applySession(data.session);
      }
      set({ isLoading: false, error: error?.message });
      return error?.message;
    },

    signUpWithEmail: async (email, password, metadata) => {
      set({ isLoading: true, error: undefined });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: metadata ? { data: metadata } : undefined
      });
      const metadataOverride = parseMetadataOverride(metadata);
      if (data.session) {
        applySession(data.session);
        set((state) => ({
          selectedRole: state.selectedRole ?? metadataOverride.selectedRole,
          selectedUserId: state.selectedUserId ?? metadataOverride.selectedUserId
        }));
      }
      set({ isLoading: false, error: error?.message });
      return error?.message;
    },

    selectRole: async (role, userId) => {
      const { user } = get();
      if (!user) {
        const message = "You must sign in before selecting a role.";
        set({ error: message });
        return message;
      }

      set({ isLoading: true, error: undefined });
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...(user.user_metadata ?? {}),
          selected_role: role,
          selected_user_id: userId
        }
      });

      if (error) {
        set({ isLoading: false, error: error.message });
        return error.message;
      }

      set({
        user: data.user,
        selectedRole: role,
        selectedUserId: userId,
        isLoading: false
      });
      return undefined;
    },

    signOut: async () => {
      set({ isLoading: true, error: undefined });
      const { error } = await supabase.auth.signOut();
      if (error) {
        set({ isLoading: false, error: error.message });
        return;
      }

      applySession(null);
      set({ isLoading: false });
    },

    clearError: () => set({ error: undefined })
  };
});
