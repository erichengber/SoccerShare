import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@/types/domain";

interface AuthState {
  selectedRole?: UserRole;
  selectedUserId?: string;
  selectRole: (role: UserRole, userId: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      selectedRole: undefined,
      selectedUserId: undefined,
      selectRole: (role, userId) => set({ selectedRole: role, selectedUserId: userId }),
      clearSession: () => set({ selectedRole: undefined, selectedUserId: undefined })
    }),
    {
      name: "soccershare-auth"
    }
  )
);
