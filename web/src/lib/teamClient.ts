import { supabase } from "@/lib/supabase";
import type { Team, TeamLevel } from "@/types/domain";

interface TeamRow {
  id: string;
  name: string;
  level: TeamLevel;
  school_id: string | null;
  coach_ids: string[] | null;
  player_ids: string[] | null;
}

interface CoachRow {
  id: string;
  team_id: string | null;
  school_id: string | null;
}

interface TeamClientResult<T> {
  data?: T;
  error?: string;
}

interface CreateCoachTeamPayload {
  coachId: string;
  name: string;
  level: TeamLevel;
  schoolId?: string;
}

interface CoachTeamSnapshot {
  team?: Team;
  teamId?: string;
  schoolId?: string;
}

function mapTeamRowToTeam(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    level: row.level,
    schoolId: row.school_id ?? undefined,
    coachIds: row.coach_ids ?? [],
    playerIds: row.player_ids ?? []
  };
}

function buildTeamId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `team-${Date.now()}`;
}

export async function createCoachTeamInSupabase(
  payload: CreateCoachTeamPayload
): Promise<TeamClientResult<{ team: Team }>> {
  if (!supabase) {
    return {
      error: "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    };
  }

  const teamId = buildTeamId();
  const trimmedName = payload.name.trim();
  const schoolId = payload.schoolId?.trim() || null;

  const { data: createdTeamRow, error: createTeamError } = await supabase
    .from("teams")
    .insert({
      id: teamId,
      name: trimmedName,
      level: payload.level,
      school_id: schoolId,
      coach_ids: [payload.coachId],
      player_ids: []
    })
    .select("id, name, level, school_id, coach_ids, player_ids")
    .single();

  if (createTeamError || !createdTeamRow) {
    return {
      error: createTeamError?.message ?? "Unable to create team in Supabase."
    };
  }
  const normalizedCreatedTeamRow = createdTeamRow as TeamRow;

  const { data: updatedCoachRows, error: updateCoachError } = await supabase
    .from("coaches")
    .update({
      team_id: normalizedCreatedTeamRow.id,
      school_id: schoolId
    })
    .eq("id", payload.coachId)
    .select("id");

  if (updateCoachError) {
    return {
      error: updateCoachError.message
    };
  }

  if (!updatedCoachRows?.length) {
    const { error: insertCoachError } = await supabase.from("coaches").insert({
      id: payload.coachId,
      team_id: normalizedCreatedTeamRow.id,
      school_id: schoolId
    });

    if (insertCoachError) {
      return {
        error: insertCoachError.message
      };
    }
  }

  return {
    data: {
      team: mapTeamRowToTeam(normalizedCreatedTeamRow)
    }
  };
}

export async function fetchCoachTeamFromSupabase(
  coachId: string
): Promise<TeamClientResult<CoachTeamSnapshot>> {
  if (!supabase) {
    return {
      error: "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    };
  }

  const { data: coachRow, error: coachError } = await supabase
    .from("coaches")
    .select("id, team_id, school_id")
    .eq("id", coachId)
    .maybeSingle();

  if (coachError) {
    return {
      error: coachError.message
    };
  }

  if (!coachRow) {
    return {
      data: {}
    };
  }
  const normalizedCoachRow = coachRow as CoachRow;

  const teamId = normalizedCoachRow.team_id ?? undefined;
  if (!teamId) {
    return {
      data: {
        teamId: undefined,
        schoolId: normalizedCoachRow.school_id ?? undefined
      }
    };
  }

  const { data: teamRow, error: teamError } = await supabase
    .from("teams")
    .select("id, name, level, school_id, coach_ids, player_ids")
    .eq("id", teamId)
    .maybeSingle();

  if (teamError) {
    return {
      error: teamError.message
    };
  }

  return {
    data: {
      team: teamRow ? mapTeamRowToTeam(teamRow as TeamRow) : undefined,
      teamId,
      schoolId: normalizedCoachRow.school_id ?? undefined
    }
  };
}
