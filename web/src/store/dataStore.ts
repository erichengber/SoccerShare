import { create } from "zustand";
import { mockData } from "@/data/mockData";
import type {
  AppData,
  Clip,
  ClipUploadInput,
  ClipUpdateInput,
  CoachGameInput,
  Player,
  PlayerPrivacy,
  TeamInvite,
  TeamInviteResponseInput
} from "@/types/domain";

interface ActionResult {
  success: boolean;
  error?: string;
}

interface DataState {
  data: AppData;
  invitePlayerToTeam: (coachId: string, playerId: string) => ActionResult;
  respondToTeamInvite: (input: TeamInviteResponseInput) => ActionResult;
  addCoachGame: (coachId: string, input: CoachGameInput) => ActionResult;
  uploadClip: (input: ClipUploadInput) => void;
  updateClip: (input: ClipUpdateInput) => void;
  setPlayerPrivacy: (playerId: string, privacy: PlayerPrivacy) => void;
}

function addTeamToPlayer(player: Player, teamId: string): Player {
  if (player.teamIds.includes(teamId)) return player;
  return { ...player, teamIds: [...player.teamIds, teamId] };
}

export const useDataStore = create<DataState>((set, get) => ({
  data: mockData,
  invitePlayerToTeam: (coachId, playerId) => {
    const { data } = get();
    const coach = data.coaches.find((entry) => entry.id === coachId);
    if (!coach) {
      return { success: false, error: "Coach not found." };
    }

    const player = data.players.find((entry) => entry.id === playerId);
    if (!player) {
      return { success: false, error: "Player not found." };
    }

    if (player.teamIds.includes(coach.teamId)) {
      return { success: false, error: "Player is already on this team." };
    }

    const hasPendingInvite = data.teamInvites.some(
      (invite) =>
        invite.playerId === playerId &&
        invite.teamId === coach.teamId &&
        invite.status === "pending"
    );
    if (hasPendingInvite) {
      return { success: false, error: "An invite is already pending for this player." };
    }

    const invite: TeamInvite = {
      id: `invite-${Date.now()}`,
      teamId: coach.teamId,
      playerId,
      invitedByCoachId: coachId,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    set((state) => ({
      data: {
        ...state.data,
        teamInvites: [invite, ...state.data.teamInvites]
      }
    }));

    return { success: true };
  },
  respondToTeamInvite: ({ inviteId, responderRole, responderId, accept }) => {
    const { data } = get();
    const invite = data.teamInvites.find((entry) => entry.id === inviteId);
    if (!invite) {
      return { success: false, error: "Invite not found." };
    }

    if (invite.status !== "pending") {
      return { success: false, error: "This invite has already been handled." };
    }

    const player = data.players.find((entry) => entry.id === invite.playerId);
    if (!player) {
      return { success: false, error: "Invited player no longer exists." };
    }

    if (responderRole === "player" && responderId !== player.id) {
      return { success: false, error: "Players can only respond to their own invites." };
    }

    if (responderRole === "parent") {
      const parent = data.parents.find((entry) => entry.id === responderId);
      if (!parent || !parent.playerIds.includes(player.id)) {
        return { success: false, error: "Parent is not linked to this player." };
      }
    }

    const nextStatus: TeamInvite["status"] = accept ? "accepted" : "declined";

    set((state) => {
      const teamInvites = state.data.teamInvites.map((entry) =>
        entry.id === inviteId
          ? {
              ...entry,
              status: nextStatus,
              respondedAt: new Date().toISOString(),
              respondedByRole: responderRole
            }
          : entry
      );

      if (!accept) {
        return {
          data: {
            ...state.data,
            teamInvites
          }
        };
      }

      const players = state.data.players.map((entry) =>
        entry.id === invite.playerId ? addTeamToPlayer(entry, invite.teamId) : entry
      );
      const teams = state.data.teams.map((team) =>
        team.id === invite.teamId && !team.playerIds.includes(invite.playerId)
          ? { ...team, playerIds: [...team.playerIds, invite.playerId] }
          : team
      );
      const users = state.data.users.map((user) =>
        user.role === "player" && user.id === invite.playerId
          ? addTeamToPlayer(user, invite.teamId)
          : user
      );

      return {
        data: {
          ...state.data,
          players,
          teams,
          users,
          teamInvites
        }
      };
    });

    return { success: true };
  },
  addCoachGame: (coachId, input) => {
    const { data } = get();
    const coach = data.coaches.find((entry) => entry.id === coachId);
    if (!coach) {
      return { success: false, error: "Coach not found." };
    }

    const opponentTeam = data.teams.find((entry) => entry.id === input.opponentTeamId);
    if (!opponentTeam) {
      return { success: false, error: "Opponent team not found." };
    }

    if (input.opponentTeamId === coach.teamId) {
      return { success: false, error: "Opponent team must be different from your team." };
    }

    const date = new Date(input.date);
    if (Number.isNaN(date.getTime())) {
      return { success: false, error: "Please enter a valid game date and time." };
    }

    const location = input.location.trim();
    if (!location) {
      return { success: false, error: "Location is required." };
    }

    const isHome = input.homeOrAway === "home";
    const gameId = `game-${Date.now()}`;
    const newGame = {
      id: gameId,
      tournamentId: input.tournamentId,
      date: date.toISOString(),
      location,
      homeTeamId: isHome ? coach.teamId : input.opponentTeamId,
      awayTeamId: isHome ? input.opponentTeamId : coach.teamId,
      createdByCoachId: coachId
    };

    set((state) => ({
      data: {
        ...state.data,
        games: [newGame, ...state.data.games],
        tournaments: input.tournamentId
          ? state.data.tournaments.map((tournament) =>
              tournament.id === input.tournamentId &&
              !tournament.gameIds.includes(gameId)
                ? { ...tournament, gameIds: [...tournament.gameIds, gameId] }
                : tournament
            )
          : state.data.tournaments
      }
    }));

    return { success: true };
  },
  uploadClip: (input) => {
    set((state) => {
      const newClip: Clip = {
        id: `clip-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...input
      };

      // Future Supabase integration point:
      // 1) Upload local file to Supabase Storage and capture the public/signed URL.
      // 2) Persist clip metadata row instead of in-memory append.
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
