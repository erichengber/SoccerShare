import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildDefaultAccounts,
  loginWithPassword,
  registerWithPassword,
  type AuthAccount,
  type RegisterAccountInput
} from "@/lib/authClient";
import type { UserRole } from "@/types/domain";

interface AuthActionResult {
  success: boolean;
  error?: string;
  role?: UserRole;
  onboardingRequired?: boolean;
}

interface AuthState {
  selectedRole?: UserRole;
  selectedUserId?: string;
  authEmail?: string;
  accounts: Record<string, AuthAccount>;
  onboardingCompleteByUserId: Record<string, boolean>;
  selectRole: (role: UserRole, userId: string) => void;
  clearSession: () => void;
  login: (email: string, password: string) => AuthActionResult;
  register: (input: RegisterAccountInput) => AuthActionResult;
  markOnboardingComplete: (userId: string) => void;
  isOnboardingComplete: (userId: string) => boolean;
}

const defaultAccounts = buildDefaultAccounts();
// Supabase handoff note:
// - `onboardingCompleteByUserId` is local-only session state for MVP.
// - Replace with a DB-backed onboarding flag/derived check from the profile row.
// - On login, fetch profile completion from Supabase and drive `onboardingRequired` from that source.
const defaultOnboardingCompletionByUserId = Object.values(defaultAccounts).reduce<Record<string, boolean>>(
  (acc, account) => {
    acc[account.userId] = true;
    return acc;
  },
  {}
);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      selectedRole: undefined,
      selectedUserId: undefined,
      authEmail: undefined,
      accounts: defaultAccounts,
      onboardingCompleteByUserId: defaultOnboardingCompletionByUserId,
      selectRole: (role, userId) => set({ selectedRole: role, selectedUserId: userId }),
      clearSession: () =>
        set({
          selectedRole: undefined,
          selectedUserId: undefined,
          authEmail: undefined
        }),
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

        const onboardingComplete =
          get().onboardingCompleteByUserId[result.account.userId] ?? result.account.role !== "player";

        return {
          success: true,
          role: result.account.role,
          onboardingRequired: result.account.role === "player" && !onboardingComplete
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
          selectedRole: account.role,
          selectedUserId: account.userId,
          authEmail: account.email,
          accounts: {
            ...state.accounts,
            [account.email]: account
          },
          onboardingCompleteByUserId: {
            ...state.onboardingCompleteByUserId,
            [account.userId]: account.role !== "player"
          }
        }));

        return {
          success: true,
          role: account.role,
          onboardingRequired: account.role === "player"
        };
      },
      markOnboardingComplete: (userId) =>
        set((state) => ({
          onboardingCompleteByUserId: {
            ...state.onboardingCompleteByUserId,
            [userId]: true
          }
        })),
      isOnboardingComplete: (userId) => get().onboardingCompleteByUserId[userId] ?? false
    }),
    {
      name: "soccershare-auth",
      partialize: (state) => ({
        selectedRole: state.selectedRole,
        selectedUserId: state.selectedUserId,
        authEmail: state.authEmail,
        accounts: state.accounts,
        onboardingCompleteByUserId: state.onboardingCompleteByUserId
      })
    }
  )
);
