import { create } from "zustand";
import { mockData } from "@/data/mockData";
import { fetchClipsFromSupabase, upsertClipInSupabase } from "@/lib/clipClient";
import { upsertParentInSupabase, upsertPlayerInSupabase } from "@/lib/familyClient";
import { upsertRecruiterInSupabase } from "@/lib/recruiterClient";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createCoachTeamInSupabase, fetchCoachTeamFromSupabase } from "@/lib/teamClient";
import { uploadClipMedia } from "@/lib/mediaClient";
import type {
  AppData,
  Clip,
  ClipUploadInput,
  ClipUpdateInput,
  CoachOnboardingInput,
  Coach,
  CoachGameInput,
  CoachTournamentInput,
  CreateCoachTeamInput,
  Parent,
  ParentOnboardingInput,
  Player,
  PlayerOnboardingInput,
  PlayerPrivacy,
  RecruiterOnboardingInput,
  Team,
  TeamInvite,
  TeamInviteResponseInput
} from "@/types/domain";

interface ActionResult {
  success: boolean;
  error?: string;
}

type AsyncActionResult = Promise<ActionResult>;

interface DataState {
  data: AppData;
  clipsInitialized: boolean;
  clipsLoading: boolean;
  clipsSyncError?: string;
  loadClips: () => Promise<void>;
  createCoachTeam: (coachId: string, input: CreateCoachTeamInput) => AsyncActionResult;
  syncCoachTeamFromSupabase: (coachId: string) => AsyncActionResult;
  invitePlayerToTeam: (coachId: string, playerId: string) => ActionResult;
  respondToTeamInvite: (input: TeamInviteResponseInput) => ActionResult;
  addCoachGame: (coachId: string, input: CoachGameInput) => ActionResult;
  addCoachTournament: (coachId: string, input: CoachTournamentInput) => ActionResult;
  uploadClip: (input: ClipUploadInput) => AsyncActionResult;
  updateClip: (input: ClipUpdateInput) => AsyncActionResult;
  setPlayerPrivacy: (playerId: string, privacy: PlayerPrivacy) => void;
  completePlayerOnboarding: (input: PlayerOnboardingInput) => AsyncActionResult;
  completeCoachOnboarding: (input: CoachOnboardingInput) => AsyncActionResult;
  completeRecruiterOnboarding: (input: RecruiterOnboardingInput) => AsyncActionResult;
  completeParentOnboarding: (input: ParentOnboardingInput) => AsyncActionResult;
}

function addTeamToPlayer(player: Player, teamId: string): Player {
  if (player.teamIds.includes(teamId)) return player;
  return { ...player, teamIds: [...player.teamIds, teamId] };
}

function upsertTeam(teams: Team[], team: Team): Team[] {
  const existingTeamIndex = teams.findIndex((entry) => entry.id === team.id);
  if (existingTeamIndex === -1) {
    return [team, ...teams];
  }

  return teams.map((entry) => (entry.id === team.id ? team : entry));
}

function applyCoachTeamAssignment(
  data: AppData,
  coachId: string,
  nextTeamId: string | undefined,
  schoolId: string | undefined
) {
  const currentCoach = data.coaches.find((coach) => coach.id === coachId);
  const previousTeamId = currentCoach?.teamId;

  const teams = data.teams.map((team) => {
    if (previousTeamId && team.id === previousTeamId && previousTeamId !== nextTeamId) {
      return {
        ...team,
        coachIds: team.coachIds.filter((id) => id !== coachId)
      };
    }

    if (nextTeamId && team.id === nextTeamId && !team.coachIds.includes(coachId)) {
      return {
        ...team,
        coachIds: [...team.coachIds, coachId]
      };
    }

    return team;
  });

  const coaches = data.coaches.map((coach) =>
    coach.id === coachId
      ? {
          ...coach,
          teamId: nextTeamId,
          schoolId
        }
      : coach
  );
  const users = data.users.map((user) =>
    user.role === "coach" && user.id === coachId
      ? {
          ...user,
          teamId: nextTeamId,
          schoolId
        }
      : user
  );

  return {
    ...data,
    teams,
    coaches: coaches as Coach[],
    users
  };
}

function buildClipId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `clip-${Date.now()}`;
}

function mergeClips(localClips: Clip[], remoteClips: Clip[]) {
  const clipsById = new Map<string, Clip>();

  localClips.forEach((clip) => {
    clipsById.set(clip.id, clip);
  });
  remoteClips.forEach((clip) => {
    clipsById.set(clip.id, clip);
  });

  return Array.from(clipsById.values()).sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)
  );
}

export const useDataStore = create<DataState>((set, get) => ({
  data: mockData,
  clipsInitialized: false,
  clipsLoading: false,
  clipsSyncError: undefined,
  loadClips: async () => {
    const { clipsInitialized, clipsLoading } = get();
    if (clipsInitialized || clipsLoading) {
      return;
    }

    set({
      clipsLoading: true
    });

    const result = await fetchClipsFromSupabase();
    if (!result.data) {
      set({
        clipsInitialized: true,
        clipsLoading: false,
        clipsSyncError: result.error ?? "Unable to sync clips from Supabase."
      });
      return;
    }

    set((state) => ({
      clipsInitialized: true,
      clipsLoading: false,
      clipsSyncError: undefined,
      data: {
        ...state.data,
        clips: mergeClips(state.data.clips, result.data ?? [])
      }
    }));
  },
  createCoachTeam: async (coachId, input) => {
    const { data } = get();
    const coach = data.coaches.find((entry) => entry.id === coachId);
    if (!coach) {
      return { success: false, error: "Coach not found." };
    }

    const teamName = input.name.trim();
    if (!teamName) {
      return { success: false, error: "Team name is required." };
    }

    const schoolId = input.schoolId?.trim() || undefined;
    if (schoolId && !data.schools.some((school) => school.id === schoolId)) {
      return { success: false, error: "Selected school is invalid." };
    }

    const createResult = await createCoachTeamInSupabase({
      coachId,
      name: teamName,
      level: input.level,
      schoolId,
      firstName: input.firstName?.trim() || coach.firstName,
      lastName: input.lastName?.trim() || coach.lastName,
      email: input.email?.trim() || coach.email,
      avatarUrl: input.avatarUrl?.trim() || coach.avatarUrl
    });

    if (!createResult.data?.team) {
      return {
        success: false,
        error: createResult.error ?? "Unable to create team."
      };
    }

    const createdTeam = createResult.data.team;

    set((state) => {
      const nextDataWithAssignment = applyCoachTeamAssignment(
        state.data,
        coachId,
        createdTeam.id,
        createdTeam.schoolId
      );

      return {
        data: {
          ...nextDataWithAssignment,
          teams: upsertTeam(nextDataWithAssignment.teams, {
            ...createdTeam,
            coachIds: createdTeam.coachIds.includes(coachId)
              ? createdTeam.coachIds
              : [...createdTeam.coachIds, coachId]
          })
        }
      };
    });

    return { success: true };
  },
  syncCoachTeamFromSupabase: async (coachId) => {
    const { data } = get();
    if (!data.coaches.some((entry) => entry.id === coachId)) {
      return { success: false, error: "Coach not found." };
    }

    const syncResult = await fetchCoachTeamFromSupabase(coachId);
    if (!syncResult.data) {
      return {
        success: false,
        error: syncResult.error ?? "Unable to sync coach team."
      };
    }

    set((state) => {
      const assignedData = applyCoachTeamAssignment(
        state.data,
        coachId,
        syncResult.data?.teamId,
        syncResult.data?.schoolId
      );

      if (!syncResult.data?.team) {
        return { data: assignedData };
      }

      return {
        data: {
          ...assignedData,
          teams: upsertTeam(
            assignedData.teams,
            syncResult.data.team.coachIds.includes(coachId)
              ? syncResult.data.team
              : {
                  ...syncResult.data.team,
                  coachIds: [...syncResult.data.team.coachIds, coachId]
                }
          )
        }
      };
    });

    return { success: true };
  },
  invitePlayerToTeam: (coachId, playerId) => {
    const { data } = get();
    const coach = data.coaches.find((entry) => entry.id === coachId);
    if (!coach) {
      return { success: false, error: "Coach not found." };
    }
    if (!coach.teamId) {
      return { success: false, error: "Create a team before inviting players." };
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
    if (!coach.teamId) {
      return { success: false, error: "Create a team before adding games." };
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
  addCoachTournament: (coachId, input) => {
    const { data } = get();
    const coach = data.coaches.find((entry) => entry.id === coachId);
    if (!coach) {
      return { success: false, error: "Coach not found." };
    }

    const name = input.name.trim();
    if (!name) {
      return { success: false, error: "Tournament name is required." };
    }

    const location = input.location.trim();
    if (!location) {
      return { success: false, error: "Tournament location is required." };
    }

    const startDate = new Date(input.startDate);
    if (Number.isNaN(startDate.getTime())) {
      return { success: false, error: "Please enter a valid tournament start date." };
    }

    const endDate = new Date(input.endDate);
    if (Number.isNaN(endDate.getTime())) {
      return { success: false, error: "Please enter a valid tournament end date." };
    }

    if (endDate < startDate) {
      return { success: false, error: "Tournament end date must be on or after the start date." };
    }

    set((state) => ({
      data: {
        ...state.data,
        tournaments: [
          {
            id: `tournament-${Date.now()}`,
            name,
            location,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            gameIds: [],
            createdByCoachId: coachId
          },
          ...state.data.tournaments
        ]
      }
    }));

    return { success: true };
  },
  uploadClip: async (input) => {
    const clipId = buildClipId();
    const createdAt = new Date().toISOString();

    let nextClip: Clip;

    if (isSupabaseConfigured) {
      try {
        const uploadedMedia = await uploadClipMedia({
          clipId,
          playerId: input.playerId,
          videoFile: input.videoFile,
          posterFile: input.posterFile
        });

        nextClip = {
          id: clipId,
          playerId: input.playerId,
          title: input.title,
          videoUrl: uploadedMedia.video.url,
          posterUrl: uploadedMedia.poster?.url,
          durationSec: input.durationSec,
          tags: input.tags,
          notes: input.notes,
          gameId: input.gameId,
          tournamentId: input.tournamentId,
          createdAt
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unable to upload clip media."
        };
      }
    } else {
      nextClip = {
        id: clipId,
        playerId: input.playerId,
        title: input.title,
        videoUrl: URL.createObjectURL(input.videoFile),
        posterUrl: input.posterFile ? URL.createObjectURL(input.posterFile) : undefined,
        durationSec: input.durationSec,
        tags: input.tags,
        notes: input.notes,
        gameId: input.gameId,
        tournamentId: input.tournamentId,
        createdAt
      };
    }

    const saveResult = await upsertClipInSupabase(nextClip);
    if (!saveResult.data) {
      return {
        success: false,
        error: saveResult.error ?? "Unable to save clip metadata."
      };
    }

    set((state) => ({
      data: {
        ...state.data,
        clips: mergeClips(state.data.clips, [saveResult.data as Clip])
      }
    }));

    return { success: true };
  },
  updateClip: async (input) => {
    const existingClip = get().data.clips.find((clip) => clip.id === input.clipId);
    if (!existingClip) {
      return {
        success: false,
        error: "Clip not found."
      };
    }

    const updatedClip: Clip = {
      ...existingClip,
      tags: input.tags,
      notes: input.notes
    };

    const saveResult = await upsertClipInSupabase(updatedClip);
    if (!saveResult.data) {
      return {
        success: false,
        error: saveResult.error ?? "Unable to update clip."
      };
    }

    set((state) => ({
      data: {
        ...state.data,
        clips: mergeClips(
          state.data.clips.filter((clip) => clip.id !== input.clipId),
          [saveResult.data as Clip]
        )
      }
    }));

    return { success: true };
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
  },
  completePlayerOnboarding: async (input) => {
    const { data } = get();
    const player = data.players.find((entry) => entry.id === input.playerId);
    if (!player) {
      return { success: false, error: "Player not found." };
    }

    const team = data.teams.find((entry) => entry.id === input.teamId);
    if (!team) {
      return { success: false, error: "Selected team was not found." };
    }

    if (!Number.isInteger(input.jerseyNumber) || input.jerseyNumber < 0 || input.jerseyNumber > 99) {
      return { success: false, error: "Jersey number must be between 0 and 99." };
    }

    const bio = input.bio.trim();
    if (!bio) {
      return { success: false, error: "Profile summary is required." };
    }

    const avatarUrl = input.avatarUrl.trim();
    if (!avatarUrl) {
      return { success: false, error: "Profile picture is required." };
    }

    const nextTeamIds = [input.teamId];
    const playerForSupabase: Player = {
      ...player,
      firstName: input.firstName?.trim() || player.firstName,
      lastName: input.lastName?.trim() || player.lastName,
      email: input.email?.trim() || player.email,
      position: input.position,
      jerseyNumber: input.jerseyNumber,
      teamIds: nextTeamIds,
      bio,
      avatarUrl
    };

    const upsertResult = await upsertPlayerInSupabase({
      player: playerForSupabase
    });

    if (!upsertResult.data) {
      return {
        success: false,
        error: upsertResult.error ?? "Unable to save player profile."
      };
    }

    set((state) => {
      const players = state.data.players.map((entry) =>
        entry.id === input.playerId
          ? {
              ...entry,
              firstName: playerForSupabase.firstName,
              lastName: playerForSupabase.lastName,
              email: playerForSupabase.email,
              position: input.position,
              jerseyNumber: input.jerseyNumber,
              teamIds: nextTeamIds,
              bio,
              avatarUrl
            }
          : entry
      );
      const users = state.data.users.map((entry) =>
        entry.id === input.playerId && entry.role === "player"
          ? {
              ...entry,
              firstName: playerForSupabase.firstName,
              lastName: playerForSupabase.lastName,
              email: playerForSupabase.email,
              position: input.position,
              jerseyNumber: input.jerseyNumber,
              teamIds: nextTeamIds,
              bio,
              avatarUrl
            }
          : entry
      );
      const teams = state.data.teams.map((entry) => {
        const shouldContainPlayer = entry.id === input.teamId;
        const currentlyContainsPlayer = entry.playerIds.includes(input.playerId);

        if (shouldContainPlayer && !currentlyContainsPlayer) {
          return {
            ...entry,
            playerIds: [...entry.playerIds, input.playerId]
          };
        }

        if (!shouldContainPlayer && currentlyContainsPlayer) {
          return {
            ...entry,
            playerIds: entry.playerIds.filter((id) => id !== input.playerId)
          };
        }

        return entry;
      });

      return {
        data: {
          ...state.data,
          players,
          users,
          teams
        }
      };
    });

    return { success: true };
  },
  completeCoachOnboarding: async (input) => {
    const { data, createCoachTeam } = get();
    const coach = data.coaches.find((entry) => entry.id === input.coachId);
    if (!coach) {
      return { success: false, error: "Coach not found." };
    }

    const avatarUrl = input.avatarUrl.trim();
    if (!avatarUrl) {
      return { success: false, error: "Profile picture is required." };
    }

    if (input.schoolId && !data.schools.some((school) => school.id === input.schoolId)) {
      return { success: false, error: "Selected school is invalid." };
    }

    const createResult = await createCoachTeam(input.coachId, {
      name: input.teamName,
      level: input.level,
      schoolId: input.schoolId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      avatarUrl
    });

    if (!createResult.success) {
      return createResult;
    }

    set((state) => ({
      data: {
        ...state.data,
        coaches: state.data.coaches.map((entry) =>
          entry.id === input.coachId
            ? {
                ...entry,
                avatarUrl
              }
            : entry
        ),
        users: state.data.users.map((entry) =>
          entry.id === input.coachId && entry.role === "coach"
            ? {
                ...entry,
                avatarUrl
              }
            : entry
        )
      }
    }));

    return { success: true };
  },
  completeRecruiterOnboarding: async (input) => {
    const { data } = get();
    const recruiter = data.recruiters.find((entry) => entry.id === input.recruiterId);
    if (!recruiter) {
      return { success: false, error: "Recruiter not found." };
    }

    const organization = input.organization.trim();
    if (!organization) {
      return { success: false, error: "Organization is required." };
    }

    const region = input.region.trim();
    if (!region) {
      return { success: false, error: "Region is required." };
    }

    const avatarUrl = input.avatarUrl.trim();
    if (!avatarUrl) {
      return { success: false, error: "Profile picture is required." };
    }

    const upsertResult = await upsertRecruiterInSupabase({
      recruiterId: input.recruiterId,
      firstName: input.firstName?.trim() || recruiter.firstName,
      lastName: input.lastName?.trim() || recruiter.lastName,
      email: input.email?.trim() || recruiter.email,
      avatarUrl,
      organization,
      region
    });

    if (!upsertResult.data) {
      return {
        success: false,
        error: upsertResult.error ?? "Unable to save recruiter profile."
      };
    }

    set((state) => ({
      data: {
        ...state.data,
        recruiters: state.data.recruiters.map((entry) =>
          entry.id === input.recruiterId
            ? {
                ...entry,
                organization,
                region,
                avatarUrl
              }
            : entry
        ),
        users: state.data.users.map((entry) =>
          entry.id === input.recruiterId && entry.role === "recruiter"
            ? {
                ...entry,
                organization,
                region,
                avatarUrl
              }
            : entry
        )
      }
    }));

    return { success: true };
  },
  completeParentOnboarding: async (input) => {
    const { data } = get();
    const parent = data.parents.find((entry) => entry.id === input.parentId);
    if (!parent) {
      return { success: false, error: "Parent not found." };
    }

    const player = data.players.find((entry) => entry.id === input.playerId);
    if (!player) {
      return { success: false, error: "Selected player was not found." };
    }

    const avatarUrl = input.avatarUrl.trim();
    if (!avatarUrl) {
      return { success: false, error: "Profile picture is required." };
    }

    const nextPlayerIds = parent.playerIds.includes(input.playerId) ? parent.playerIds : [input.playerId];
    const nextParentIds = player.parentIds.includes(input.parentId)
      ? player.parentIds
      : [...player.parentIds, input.parentId];
    const parentForSupabase: Parent = {
      ...parent,
      firstName: input.firstName?.trim() || parent.firstName,
      lastName: input.lastName?.trim() || parent.lastName,
      email: input.email?.trim() || parent.email,
      avatarUrl,
      playerIds: nextPlayerIds
    };
    const playerForSupabase: Player = {
      ...player,
      parentIds: nextParentIds
    };

    const [parentUpsertResult, playerUpsertResult] = await Promise.all([
      upsertParentInSupabase({
        parent: parentForSupabase
      }),
      upsertPlayerInSupabase({
        player: playerForSupabase
      })
    ]);

    if (!parentUpsertResult.data) {
      return {
        success: false,
        error: parentUpsertResult.error ?? "Unable to save parent profile."
      };
    }

    if (!playerUpsertResult.data) {
      return {
        success: false,
        error: playerUpsertResult.error ?? "Unable to link player profile."
      };
    }

    set((state) => ({
      data: {
        ...state.data,
        parents: state.data.parents.map((entry) =>
          entry.id === input.parentId
            ? {
                ...entry,
                firstName: parentForSupabase.firstName,
                lastName: parentForSupabase.lastName,
                email: parentForSupabase.email,
                avatarUrl,
                playerIds: nextPlayerIds
              }
            : entry
        ),
        players: state.data.players.map((entry) =>
          entry.id === input.playerId
            ? {
                ...entry,
                parentIds: nextParentIds
              }
            : entry
        ),
        users: state.data.users.map((entry) => {
          if (entry.id === input.parentId && entry.role === "parent") {
            return {
                ...entry,
              firstName: parentForSupabase.firstName,
              lastName: parentForSupabase.lastName,
              email: parentForSupabase.email,
              avatarUrl,
              playerIds: nextPlayerIds
            };
          }

          if (entry.id === input.playerId && entry.role === "player") {
            return {
              ...entry,
              parentIds: nextParentIds
            };
          }

          return entry;
        })
      }
    }));

    return { success: true };
  }
}));
