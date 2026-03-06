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
import type { UserRole } from "@/types/domain";

interface AuthActionResult {
  success: boolean;
  error?: string;
  role?: UserRole;
}

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

        set({
          selectedRole: result.account.role,
          selectedUserId: result.account.userId,
          authEmail: result.account.email
        });

        return {
          success: true,
          role: result.account.role
        };
      },
      register: (input) => {
        const result = registerWithPassword(get().accounts, input);

        if (!result.success || !result.account) {
          return {
            success: false,
            error: result.error ?? "Registration failed."
          };
        }

        const account = result.account;

        set((state) => ({
          accounts: {
            ...state.accounts,
            [account.email]: account
          }
        }));

        return {
          success: true,
          role: account.role
        };
      }
    }),
    {
      name: "soccershare-auth"
    }
  )
);
