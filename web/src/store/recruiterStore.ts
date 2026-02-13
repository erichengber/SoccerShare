import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecruiterState {
  favoritePlayerIds: string[];
  savedClipIds: string[];
  toggleFavoritePlayer: (playerId: string) => void;
  toggleSavedClip: (clipId: string) => void;
}

export const useRecruiterStore = create<RecruiterState>()(
  persist(
    (set) => ({
      favoritePlayerIds: [],
      savedClipIds: [],
      toggleFavoritePlayer: (playerId) =>
        set((state) => {
          const alreadyFavorite = state.favoritePlayerIds.includes(playerId);
          return {
            favoritePlayerIds: alreadyFavorite
              ? state.favoritePlayerIds.filter((id) => id !== playerId)
              : [...state.favoritePlayerIds, playerId]
          };
        }),
      toggleSavedClip: (clipId) =>
        set((state) => {
          const alreadySaved = state.savedClipIds.includes(clipId);
          return {
            savedClipIds: alreadySaved
              ? state.savedClipIds.filter((id) => id !== clipId)
              : [...state.savedClipIds, clipId]
          };
        })
    }),
    {
      name: "soccershare-recruiter"
    }
  )
);
