import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Game, Tournament } from "@/types/domain";

interface TournamentRow {
  id: string;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
  created_by_coach_id: string | null;
}

interface GameRow {
  id: string;
  tournament_id: string | null;
  date: string;
  location: string;
  home_team_id: string;
  away_team_id: string;
  created_by_coach_id: string | null;
}

interface ScheduleClientResult<T> {
  data?: T;
  error?: string;
}

interface ScheduleSnapshot {
  tournaments: Tournament[];
  games: Game[];
}

interface CreateTournamentPayload {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  createdByCoachId: string;
}

interface CreateGamePayload {
  id: string;
  tournamentId?: string;
  date: string;
  location: string;
  homeTeamId: string;
  awayTeamId: string;
  createdByCoachId: string;
}

function mapTournamentRowToTournament(row: TournamentRow): Tournament {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    startDate: row.start_date,
    endDate: row.end_date,
    gameIds: [],
    createdByCoachId: row.created_by_coach_id ?? undefined
  };
}

function mapGameRowToGame(row: GameRow): Game {
  return {
    id: row.id,
    tournamentId: row.tournament_id ?? undefined,
    date: row.date,
    location: row.location,
    homeTeamId: row.home_team_id,
    awayTeamId: row.away_team_id,
    createdByCoachId: row.created_by_coach_id ?? undefined
  };
}

function attachGameIdsToTournaments(tournaments: Tournament[], games: Game[]): Tournament[] {
  const gameIdsByTournamentId = new Map<string, string[]>();

  games.forEach((game) => {
    if (!game.tournamentId) return;
    const gameIds = gameIdsByTournamentId.get(game.tournamentId) ?? [];
    gameIds.push(game.id);
    gameIdsByTournamentId.set(game.tournamentId, gameIds);
  });

  return tournaments.map((tournament) => ({
    ...tournament,
    gameIds: gameIdsByTournamentId.get(tournament.id) ?? tournament.gameIds
  }));
}

export async function fetchScheduleFromSupabase(): Promise<ScheduleClientResult<ScheduleSnapshot>> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      data: {
        tournaments: [],
        games: []
      }
    };
  }

  const [{ data: tournamentRows, error: tournamentError }, { data: gameRows, error: gameError }] =
    await Promise.all([
      supabase
        .from("tournaments")
        .select("id, name, location, start_date, end_date, created_by_coach_id")
        .order("start_date", { ascending: true }),
      supabase
        .from("games")
        .select("id, tournament_id, date, location, home_team_id, away_team_id, created_by_coach_id")
        .order("date", { ascending: true })
    ]);

  if (tournamentError) {
    return { error: tournamentError.message };
  }

  if (gameError) {
    return { error: gameError.message };
  }

  const games = (gameRows as GameRow[]).map(mapGameRowToGame);
  const tournaments = attachGameIdsToTournaments(
    (tournamentRows as TournamentRow[]).map(mapTournamentRowToTournament),
    games
  );

  return {
    data: {
      tournaments,
      games
    }
  };
}

export async function createTournamentInSupabase(
  payload: CreateTournamentPayload
): Promise<ScheduleClientResult<Tournament>> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      data: {
        id: payload.id,
        name: payload.name,
        location: payload.location,
        startDate: payload.startDate,
        endDate: payload.endDate,
        gameIds: [],
        createdByCoachId: payload.createdByCoachId
      }
    };
  }

  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      id: payload.id,
      name: payload.name,
      location: payload.location,
      start_date: payload.startDate,
      end_date: payload.endDate,
      created_by_coach_id: payload.createdByCoachId
    })
    .select("id, name, location, start_date, end_date, created_by_coach_id")
    .single();

  if (error || !data) {
    return {
      error: error?.message ?? "Unable to create tournament."
    };
  }

  return {
    data: mapTournamentRowToTournament(data as TournamentRow)
  };
}

export async function createGameInSupabase(
  payload: CreateGamePayload
): Promise<ScheduleClientResult<Game>> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      data: {
        id: payload.id,
        tournamentId: payload.tournamentId,
        date: payload.date,
        location: payload.location,
        homeTeamId: payload.homeTeamId,
        awayTeamId: payload.awayTeamId,
        createdByCoachId: payload.createdByCoachId
      }
    };
  }

  const { data, error } = await supabase
    .from("games")
    .insert({
      id: payload.id,
      tournament_id: payload.tournamentId ?? null,
      date: payload.date,
      location: payload.location,
      home_team_id: payload.homeTeamId,
      away_team_id: payload.awayTeamId,
      created_by_coach_id: payload.createdByCoachId
    })
    .select("id, tournament_id, date, location, home_team_id, away_team_id, created_by_coach_id")
    .single();

  if (error || !data) {
    return {
      error: error?.message ?? "Unable to create game."
    };
  }

  return {
    data: mapGameRowToGame(data as GameRow)
  };
}
