import { create } from "zustand";
import type { RecruiterFilters } from "@/types/domain";

interface UIState {
  recruiterFilters: RecruiterFilters;
  isUploadModalOpen: boolean;
  uploadTargetPlayerId?: string;
  setRecruiterFilters: (filters: Partial<RecruiterFilters>) => void;
  resetRecruiterFilters: () => void;
  openUploadModal: (playerId: string) => void;
  closeUploadModal: () => void;
}

const defaultFilters: RecruiterFilters = {};

export const useUIStore = create<UIState>((set) => ({
  recruiterFilters: defaultFilters,
  isUploadModalOpen: false,
  uploadTargetPlayerId: undefined,
  setRecruiterFilters: (filters) =>
    set((state) => ({
      recruiterFilters: {
        ...state.recruiterFilters,
        ...filters
      }
    })),
  resetRecruiterFilters: () => set({ recruiterFilters: defaultFilters }),
  openUploadModal: (playerId) => set({ isUploadModalOpen: true, uploadTargetPlayerId: playerId }),
  closeUploadModal: () => set({ isUploadModalOpen: false, uploadTargetPlayerId: undefined })
}));
