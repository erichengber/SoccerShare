import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildDefaultAccounts,
  loginWithPassword,
  registerWithPassword,
  type AuthAccount,
  type RegisterAccountInput
} from "@/lib/authClient";
import { fetchProfile, isSupabaseConfigured, supabaseAuth } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import type { UserRole } from "@/types/domain";

type AuthMetadata = {
  selected_role?: UserRole;
  selected_user_id?: string;
};

interface AuthState {
  isInitialized: boolean;
  selectedRole?: UserRole;
  selectedUserId?: string;
  authEmail?: string;
  accounts: Record<string, AuthAccount>;
  initialize: () => Promise<void>;
  selectRole: (role: UserRole, userId: string) => void;
  clearSession: () => void;
  login: (email: string, password: string) => AuthActionResult;
  register: (input: RegisterAccountInput) => AuthActionResult;
}

const defaultAccounts = buildDefaultAccounts();

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isInitialized: false,
      selectedRole: undefined,
      selectedUserId: undefined,
      authEmail: undefined,
      accounts: defaultAccounts,
      initialize: async () => {
        if (!isSupabaseConfigured) {
          set({ isInitialized: true });
          return;
        }

        try {
          const sessionResult = await supabaseAuth.getSession();
          const user = sessionResult.data.session?.user;
          if (!user) {
            set({
              isInitialized: true,
              selectedRole: undefined,
              selectedUserId: undefined,
              authEmail: undefined
            });
            return;
          }

          const profile = await fetchProfile(user.id);
          set({
            isInitialized: true,
            selectedRole: profile?.role,
            selectedUserId: profile?.linked_user_id,
            authEmail: user.email ?? undefined
          });
        } catch {
          set({ isInitialized: true });
        }
      },
      selectRole: (role, userId) => set({ selectedRole: role, selectedUserId: userId }),
      clearSession: () => {
        if (isSupabaseConfigured) {
          void supabaseAuth.signOut();
        }

        set({
          selectedRole: undefined,
          selectedUserId: undefined,
          authEmail: undefined
        });
      },
      login: (email, password) => {
        const result = loginWithPassword(get().accounts, email, password);

        if (!result.success || !result.account) {
          return {
            success: false,
            error: result.error ?? "Login failed."
          };
        }
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  selectedRole?: UserRole;
  selectedUserId?: string;
  error?: string;
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<string | undefined>;
  signUpWithEmail: (email: string, password: string) => Promise<string | undefined>;
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
        supabase.auth.onAuthStateChange((_event, session) => {
          applySession(session);
        });
      }

      set({ isInitialized: true, isLoading: false });
    },

    signInWithEmail: async (email, password) => {
      set({ isLoading: true, error: undefined });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      set({ isLoading: false, error: error?.message });
      return error?.message;
    },

    signUpWithEmail: async (email, password) => {
      set({ isLoading: true, error: undefined });
      const { error } = await supabase.auth.signUp({ email, password });
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
      const metadata: AuthMetadata = {
        selected_role: role,
        selected_user_id: userId
      };

      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...(user.user_metadata ?? {}),
          ...metadata
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
