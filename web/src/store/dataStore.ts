import { create } from "zustand";
import { mockData } from "@/data/mockData";
import type { AppData, Clip, ClipUploadInput, ClipUpdateInput, PlayerPrivacy } from "@/types/domain";

interface DataState {
  data: AppData;
  uploadClip: (input: ClipUploadInput) => void;
  updateClip: (input: ClipUpdateInput) => void;
  setPlayerPrivacy: (playerId: string, privacy: PlayerPrivacy) => void;
}

export const useDataStore = create<DataState>((set) => ({
  data: mockData,
  uploadClip: (input) => {
    set((state) => {
      const newClip: Clip = {
        id: `clip-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...input
      };

      // Future Supabase integration point: replace in-memory append with insert RPC/API call.
      return {
        data: {
          ...state.data,
          clips: [newClip, ...state.data.clips]
        }
      };
    });
  },
  updateClip: (input) => {
    set((state) => {
      // Future Supabase integration point: replace map update with optimistic update + persisted mutation.
      const clips = state.data.clips.map((clip) =>
        clip.id === input.clipId ? { ...clip, tags: input.tags, notes: input.notes } : clip
      );
      return {
        data: {
          ...state.data,
          clips
        }
      };
    });
  },
  setPlayerPrivacy: (playerId, privacy) => {
    set((state) => {
      // Future Supabase integration point: persist privacy at player profile table.
      const players = state.data.players.map((player) =>
        player.id === playerId ? { ...player, privacy } : player
      );
      const users = state.data.users.map((user) =>
        user.id === playerId && user.role === "player" ? { ...user, privacy } : user
      );

      return {
        data: {
          ...state.data,
          players,
          users
        }
      };
    });
  }
}));
