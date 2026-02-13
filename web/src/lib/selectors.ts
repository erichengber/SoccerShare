import type {
  AppData,
  Clip,
  Coach,
  Game,
  Parent,
  Player,
  RecruiterFilters,
  UserRole
} from "@/types/domain";

export function getPlayerById(data: AppData, playerId?: string) {
  return data.players.find((player) => player.id === playerId);
}

export function getParentById(data: AppData, parentId?: string): Parent | undefined {
  return data.parents.find((parent) => parent.id === parentId);
}

export function getCoachById(data: AppData, coachId?: string): Coach | undefined {
  return data.coaches.find((coach) => coach.id === coachId);
}

export function getTeamName(data: AppData, teamId: string) {
  return data.teams.find((team) => team.id === teamId)?.name ?? "Unknown Team";
}

export function getSchoolName(data: AppData, schoolId?: string) {
  if (!schoolId) return undefined;
  return data.schools.find((school) => school.id === schoolId)?.name;
}

function isParentLinkedToPlayer(data: AppData, parentId: string, player: Player) {
  const parent = getParentById(data, parentId);
  return parent?.playerIds.includes(player.id) ?? false;
}

function isCoachLinkedToPlayer(data: AppData, coachId: string, player: Player) {
  const coach = getCoachById(data, coachId);
  return coach ? player.teamIds.includes(coach.teamId) : false;
}

export function canViewPlayer(
  data: AppData,
  role: UserRole | undefined,
  viewerId: string | undefined,
  player: Player
) {
  if (!role || !viewerId) return false;

  if (role === "player") {
    return player.id === viewerId;
  }

  if (role === "parent") {
    return isParentLinkedToPlayer(data, viewerId, player);
  }

  if (role === "coach") {
    return isCoachLinkedToPlayer(data, viewerId, player);
  }

  return player.privacy === "public";
}

export function filterRecruiterPlayers(data: AppData, filters: RecruiterFilters) {
  return data.players.filter((player) => {
    if (player.privacy !== "public") return false;
    if (filters.position && player.position !== filters.position) return false;
    if (filters.gradYear && player.gradYear !== filters.gradYear) return false;
    if (filters.teamId && !player.teamIds.includes(filters.teamId)) return false;

    if (filters.tournamentId) {
      const gameIds = data.games
        .filter((game) => game.tournamentId === filters.tournamentId)
        .map((game) => game.id);

      const hasTournamentClip = data.clips.some(
        (clip) => clip.playerId === player.id && clip.gameId && gameIds.includes(clip.gameId)
      );

      if (!hasTournamentClip) return false;
    }

    return true;
  });
}

export function getPlayersForGame(data: AppData, game: Game) {
  const teamIds = [game.homeTeamId, game.awayTeamId];
  return data.players.filter(
    (player) => player.privacy === "public" && player.teamIds.some((teamId) => teamIds.includes(teamId))
  );
}

export function getPublicClipsForGame(data: AppData, gameId: string): Clip[] {
  const publicPlayerIds = new Set(
    data.players.filter((player) => player.privacy === "public").map((player) => player.id)
  );
  return data.clips.filter((clip) => clip.gameId === gameId && publicPlayerIds.has(clip.playerId));
}

export function getVisibleClipsForViewer(
  data: AppData,
  role: UserRole | undefined,
  viewerId: string | undefined,
  clips: Clip[]
) {
  return clips.filter((clip) => {
    const player = data.players.find((entry) => entry.id === clip.playerId);
    return player ? canViewPlayer(data, role, viewerId, player) : false;
  });
}
