import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Coach, Team, TeamLevel } from "@/types/domain";

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

interface CoachProfileRow extends CoachRow {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
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
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
}

interface UpdateCoachProfilePayload {
  coachId: string;
  teamId: string;
  name: string;
  level: TeamLevel;
  schoolId?: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
}

interface CoachTeamSnapshot {
  team?: Team;
  teamId?: string;
  schoolId?: string;
}

function mapCoachProfileRowToCoach(row: CoachProfileRow): Coach {
  return {
    id: row.id,
    role: "coach",
    firstName: row.first_name?.trim() || "New",
    lastName: row.last_name?.trim() || "Coach",
    email: row.email?.trim().toLowerCase() || "",
    avatarUrl: row.avatar_url?.trim() || "",
    teamId: row.team_id ?? undefined,
    schoolId: row.school_id ?? undefined
  };
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
      error:
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or VITE_SUPABASE_ANON_KEY)."
    };
  }

  const teamId = buildTeamId();
  const trimmedName = payload.name.trim();
  const schoolId = payload.schoolId?.trim() || null;
  const firstName = payload.firstName.trim();
  const lastName = payload.lastName.trim();
  const email = payload.email.trim().toLowerCase();
  const avatarUrl = payload.avatarUrl.trim();

  if (!firstName || !lastName || !email || !avatarUrl) {
    return {
      error: "Coach profile is missing required fields."
    };
  }

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
      role: "coach",
      first_name: firstName,
      last_name: lastName,
      email,
      avatar_url: avatarUrl,
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
      role: "coach",
      first_name: firstName,
      last_name: lastName,
      email,
      avatar_url: avatarUrl,
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

export async function fetchTeamsFromSupabase(): Promise<TeamClientResult<Team[]>> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      data: []
    };
  }

  const { data, error } = await supabase
    .from("teams")
    .select("id, name, level, school_id, coach_ids, player_ids")
    .order("name", { ascending: true });

  if (error) {
    return {
      error: error.message
    };
  }

  return {
    data: (data as TeamRow[]).map(mapTeamRowToTeam)
  };
}

export async function fetchCoachProfileFromSupabase(
  coachId: string
): Promise<TeamClientResult<Coach>> {
  if (!isSupabaseConfigured || !supabase) {
    return {};
  }

  const { data, error } = await supabase
    .from("coaches")
    .select("id, first_name, last_name, email, avatar_url, team_id, school_id")
    .eq("id", coachId)
    .maybeSingle();

  if (error) {
    return {
      error: error.message
    };
  }

  if (!data) {
    return {};
  }

  return {
    data: mapCoachProfileRowToCoach(data as CoachProfileRow)
  };
}

export async function fetchCoachTeamFromSupabase(
  coachId: string
): Promise<TeamClientResult<CoachTeamSnapshot>> {
  if (!supabase) {
    return {
      error:
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or VITE_SUPABASE_ANON_KEY)."
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

export async function updateCoachProfileInSupabase(
  payload: UpdateCoachProfilePayload
): Promise<TeamClientResult<{ team: Team }>> {
  if (!supabase) {
    return {
      error:
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or VITE_SUPABASE_ANON_KEY)."
    };
  }

  const teamName = payload.name.trim();
  const schoolId = payload.schoolId?.trim() || null;
  const firstName = payload.firstName.trim();
  const lastName = payload.lastName.trim();
  const email = payload.email.trim().toLowerCase();
  const avatarUrl = payload.avatarUrl.trim();

  if (!teamName) {
    return { error: "Team name is required." };
  }

  if (!firstName || !lastName || !email || !avatarUrl) {
    return {
      error: "Coach profile is missing required fields."
    };
  }

  const { data: updatedTeamRow, error: updateTeamError } = await supabase
    .from("teams")
    .update({
      name: teamName,
      level: payload.level,
      school_id: schoolId
    })
    .eq("id", payload.teamId)
    .select("id, name, level, school_id, coach_ids, player_ids")
    .single();

  if (updateTeamError || !updatedTeamRow) {
    return {
      error: updateTeamError?.message ?? "Unable to update coach team in Supabase."
    };
  }

  const { error: updateCoachError } = await supabase
    .from("coaches")
    .update({
      role: "coach",
      first_name: firstName,
      last_name: lastName,
      email,
      avatar_url: avatarUrl,
      team_id: payload.teamId,
      school_id: schoolId
    })
    .eq("id", payload.coachId);

  if (updateCoachError) {
    return {
      error: updateCoachError.message
    };
  }

  return {
    data: {
      team: mapTeamRowToTeam(updatedTeamRow as TeamRow)
    }
  };
}

export async function updateTeamPlayersInSupabase(
  teamId: string,
  playerIds: string[]
): Promise<TeamClientResult<Team>> {
  if (!supabase) {
    return {
      error:
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or VITE_SUPABASE_ANON_KEY)."
    };
  }

  const { data, error } = await supabase
    .from("teams")
    .update({
      player_ids: playerIds
    })
    .eq("id", teamId)
    .select("id, name, level, school_id, coach_ids, player_ids")
    .single();

  if (error || !data) {
    return {
      error: error?.message ?? "Unable to update team roster in Supabase."
    };
  }

  return {
    data: mapTeamRowToTeam(data as TeamRow)
  };
}
