import { mockData } from "@/data/mockData";
import type { UserRole } from "@/types/domain";

const DEMO_PASSWORD = "demo1234";

export interface AuthAccount {
  email: string;
  password: string;
  role: UserRole;
  userId: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface RegisterAccountInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  userId: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  account?: AuthAccount;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function buildDefaultAccounts() {
  const seededAt = "2026-01-01T00:00:00.000Z";

  return mockData.users.reduce<Record<string, AuthAccount>>((acc, user) => {
    const email = normalizeEmail(user.email);
    acc[email] = {
      email,
      password: DEMO_PASSWORD,
      role: user.role,
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: seededAt
    };
    return acc;
  }, {});
}

export function loginWithPassword(
  accounts: Record<string, AuthAccount>,
  email: string,
  password: string
): AuthResult {
  const normalizedEmail = normalizeEmail(email);
  const account = accounts[normalizedEmail];

  if (!account) {
    return {
      success: false,
      error: "No account found for that email."
    };
  }

  if (account.password !== password) {
    return {
      success: false,
      error: "Invalid password."
    };
  }

  return {
    success: true,
    account
  };
}

export function registerWithPassword(
  accounts: Record<string, AuthAccount>,
  input: RegisterAccountInput
): AuthResult {
  const normalizedEmail = normalizeEmail(input.email);

  if (accounts[normalizedEmail]) {
    return {
      success: false,
      error: "An account already exists for that email."
    };
  }

  if (input.password.length < 8) {
    return {
      success: false,
      error: "Password must be at least 8 characters."
    };
  }

  return {
    success: true,
    account: {
      email: normalizedEmail,
      password: input.password,
      role: input.role,
      userId: input.userId,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      createdAt: new Date().toISOString()
    }
  };
}

/**
 * Supabase handoff notes:
 * - Replace `loginWithPassword` with `supabase.auth.signInWithPassword`.
 * - Replace `registerWithPassword` with `supabase.auth.signUp`.
 * - Persist profile-role linkage in a `profiles` table (`id`, `role`, `linked_user_id`).
 * - Continue returning `{ role, userId }` so existing route permissions remain unchanged.
 */
