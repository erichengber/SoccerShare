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
}

interface AuthState {
  selectedRole?: UserRole;
  selectedUserId?: string;
  authEmail?: string;
  accounts: Record<string, AuthAccount>;
  selectRole: (role: UserRole, userId: string) => void;
  clearSession: () => void;
  login: (email: string, password: string) => AuthActionResult;
  register: (input: RegisterAccountInput) => AuthActionResult;
}

const defaultAccounts = buildDefaultAccounts();

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      selectedRole: undefined,
      selectedUserId: undefined,
      authEmail: undefined,
      accounts: defaultAccounts,
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
