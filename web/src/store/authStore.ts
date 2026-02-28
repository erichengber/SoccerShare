import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildDefaultAccounts,
  loginWithPassword,
  registerWithPassword,
  type AuthAccount,
  type RegisterAccountInput
} from "@/lib/authClient";
import {
  fetchProfile,
  isSupabaseConfigured,
  supabaseAuth,
  upsertProfile,
  type ProfileRow
} from "@/lib/supabase";
import type { UserRole } from "@/types/domain";

const VALID_ROLES: UserRole[] = ["player", "parent", "coach", "recruiter"];

function formatSupabaseAuthError(error: unknown, fallback: string) {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: number }).status)
      : undefined;
  const message = error instanceof Error ? error.message : fallback;

  if (status === 401 || /unauthorized|invalid api key|apikey/i.test(message)) {
    return "Supabase returned 401 Unauthorized. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or VITE_SUPABASE_ANON_KEY), and ensure Email/Password auth (and signups) are enabled in Supabase Auth settings.";
  }

  if (/email_address_invalid|email address .* is invalid/i.test(message)) {
    return "That email address is not accepted by Supabase. Use a real email domain (not example.com).";
  }

  return message;
}

function buildProfileFromMetadata(user: {
  id: string;
  user_metadata?: Record<string, unknown> | null;
}): ProfileRow | null {
  const metadata = user.user_metadata ?? {};
  const role = metadata.role;
  const linkedUserId = metadata.linked_user_id;

  if (typeof role !== "string" || !VALID_ROLES.includes(role as UserRole)) {
    return null;
  }

  if (typeof linkedUserId !== "string" || !linkedUserId.trim()) {
    return null;
  }

  return {
    id: user.id,
    role: role as UserRole,
    linked_user_id: linkedUserId
  };
}

async function resolveProfileForUser(user: {
  id: string;
  user_metadata?: Record<string, unknown> | null;
}): Promise<ProfileRow | null> {
  const existingProfile = await fetchProfile(user.id);
  if (existingProfile) {
    return existingProfile;
  }

  const metadataProfile = buildProfileFromMetadata(user);
  if (!metadataProfile) {
    return null;
  }

  return upsertProfile(metadataProfile);
}

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
  mode?: "demo" | "mock" | "supabase";
  supabaseUserId?: string;
  accounts: Record<string, AuthAccount>;
  initialize: () => Promise<void>;
  selectRole: (role: UserRole, userId: string) => void;
  clearSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  register: (input: RegisterAccountInput) => Promise<AuthActionResult>;
}

const defaultAccounts = buildDefaultAccounts();

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isInitialized: false,
      selectedRole: undefined,
      selectedUserId: undefined,
      authEmail: undefined,
      mode: undefined,
      supabaseUserId: undefined,
      accounts: defaultAccounts,
      initialize: async () => {
        if (!isSupabaseConfigured) {
          set({ isInitialized: true });
          return;
        }

        try {
          const sessionResult = await supabaseAuth.getSession();
          const session = sessionResult.data.session;
          const user = session?.user;

          if (!user) {
            set({
              isInitialized: true,
              mode: undefined,
              supabaseUserId: undefined,
              selectedRole: undefined,
              selectedUserId: undefined,
              authEmail: undefined
            });
            return;
          }

          const profile = await resolveProfileForUser(user);
          if (!profile) {
            set({
              isInitialized: true,
              mode: "supabase",
              supabaseUserId: user.id,
              authEmail: user.email ?? undefined,
              selectedRole: undefined,
              selectedUserId: undefined
            });
            return;
          }

          set({
            isInitialized: true,
            mode: "supabase",
            supabaseUserId: user.id,
            authEmail: user.email ?? undefined,
            selectedRole: profile.role,
            selectedUserId: profile.linked_user_id
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to initialize session.";
          set({
            isInitialized: true,
            mode: undefined,
            supabaseUserId: undefined,
            selectedRole: undefined,
            selectedUserId: undefined,
            authEmail: undefined
          });
          console.warn(message);
        }
      },
      selectRole: (role, userId) =>
        set({
          mode: "demo",
          selectedRole: role,
          selectedUserId: userId
        }),
      clearSession: async () => {
        if (get().mode === "supabase" && isSupabaseConfigured) {
          try {
            await supabaseAuth.signOut();
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to sign out.";
            console.warn(message);
          }
        }

        set({
          mode: undefined,
          supabaseUserId: undefined,
          selectedRole: undefined,
          selectedUserId: undefined,
          authEmail: undefined
        });
      },
      login: async (email, password) => {
        if (isSupabaseConfigured) {
          try {
            const { data, error } = await supabaseAuth.signIn(email, password);
            if (error) {
              return { success: false, error: error.message };
            }

            const user = data.user;
            if (!user) {
              return { success: false, error: "No user returned from Supabase." };
            }

            const profile = await resolveProfileForUser(user);
            if (!profile) {
              return {
                success: false,
                error:
                  "Your account is missing a profile mapping (role + linked user). Re-register or ask an admin to set role + linked user for this account."
              };
            }

            set({
              mode: "supabase",
              supabaseUserId: user.id,
              selectedRole: profile.role,
              selectedUserId: profile.linked_user_id,
              authEmail: user.email ?? undefined
            });

            return { success: true, role: profile.role };
          } catch (error) {
            const message = formatSupabaseAuthError(error, "Login failed.");
            return { success: false, error: message };
          }
        }

        const result = loginWithPassword(get().accounts, email, password);

        if (!result.success || !result.account) {
          return {
            success: false,
            error: result.error ?? "Login failed."
          };
        }

        set({
          mode: "mock",
          selectedRole: result.account.role,
          selectedUserId: result.account.userId,
          authEmail: result.account.email
        });

        return {
          success: true,
          role: result.account.role
        };
      },
      register: async (input) => {
        if (isSupabaseConfigured) {
          try {
            const { data, error } = await supabaseAuth.signUp(input.email, input.password, {
              role: input.role,
              linked_user_id: input.userId
            });
            if (error) {
              return { success: false, error: error.message };
            }

            if (!data.user) {
              return { success: false, error: "No user returned from Supabase registration." };
            }

            if (!data.session) {
              return {
                success: true,
                role: input.role
              };
            }

            const profile: ProfileRow = {
              id: data.user.id,
              role: input.role,
              linked_user_id: input.userId
            };

            await upsertProfile(profile);

            // Keep existing UX: registration goes to /login, so sign out after creating the profile.
            await supabaseAuth.signOut();

            return { success: true, role: input.role };
          } catch (error) {
            const message = formatSupabaseAuthError(error, "Registration failed.");
            return { success: false, error: message };
          }
        }

        const result = registerWithPassword(get().accounts, input);

        if (!result.success || !result.account) {
          return {
            success: false,
            error: result.error ?? "Registration failed."
          };
        }

        const account = result.account;

        set((state) => ({
          mode: "mock",
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
