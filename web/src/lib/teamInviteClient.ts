import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type {
  TeamInvite,
  TeamInviteResponderRole,
  TeamInviteStatus
} from "@/types/domain";

interface TeamInviteRow {
  id: string;
  team_id: string;
  player_id: string;
  invited_by_coach_id: string;
  status: TeamInviteStatus;
  created_at: string;
  responded_at: string | null;
  responded_by_role: TeamInviteResponderRole | null;
}

interface TeamInviteClientResult<T> {
  data?: T;
  error?: string;
}

interface CreateTeamInvitePayload {
  id: string;
  teamId: string;
  playerId: string;
  invitedByCoachId: string;
  status: TeamInviteStatus;
  createdAt: string;
}

interface RespondToTeamInvitePayload {
  inviteId: string;
  status: Extract<TeamInviteStatus, "accepted" | "declined">;
  respondedAt: string;
  respondedByRole: TeamInviteResponderRole;
}

function mapTeamInviteRowToInvite(row: TeamInviteRow): TeamInvite {
  return {
    id: row.id,
    teamId: row.team_id,
    playerId: row.player_id,
    invitedByCoachId: row.invited_by_coach_id,
    status: row.status,
    createdAt: row.created_at,
    respondedAt: row.responded_at ?? undefined,
    respondedByRole: row.responded_by_role ?? undefined
  };
}

export async function fetchTeamInvitesFromSupabase(): Promise<TeamInviteClientResult<TeamInvite[]>> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      data: []
    };
  }

  const { data, error } = await supabase
    .from("team_invites")
    .select(
      "id, team_id, player_id, invited_by_coach_id, status, created_at, responded_at, responded_by_role"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return {
      error: error.message
    };
  }

  return {
    data: (data as TeamInviteRow[]).map(mapTeamInviteRowToInvite)
  };
}

export async function createTeamInviteInSupabase(
  payload: CreateTeamInvitePayload
): Promise<TeamInviteClientResult<TeamInvite>> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      data: {
        id: payload.id,
        teamId: payload.teamId,
        playerId: payload.playerId,
        invitedByCoachId: payload.invitedByCoachId,
        status: payload.status,
        createdAt: payload.createdAt
      }
    };
  }

  const { data, error } = await supabase
    .from("team_invites")
    .insert({
      id: payload.id,
      team_id: payload.teamId,
      player_id: payload.playerId,
      invited_by_coach_id: payload.invitedByCoachId,
      status: payload.status,
      created_at: payload.createdAt
    })
    .select(
      "id, team_id, player_id, invited_by_coach_id, status, created_at, responded_at, responded_by_role"
    )
    .single();

  if (error || !data) {
    return {
      error: error?.message ?? "Unable to create team invite."
    };
  }

  return {
    data: mapTeamInviteRowToInvite(data as TeamInviteRow)
  };
}

export async function respondToTeamInviteInSupabase(
  payload: RespondToTeamInvitePayload
): Promise<TeamInviteClientResult<TeamInvite>> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      error: "Supabase is not configured."
    };
  }

  const { data, error } = await supabase
    .from("team_invites")
    .update({
      status: payload.status,
      responded_at: payload.respondedAt,
      responded_by_role: payload.respondedByRole
    })
    .eq("id", payload.inviteId)
    .select(
      "id, team_id, player_id, invited_by_coach_id, status, created_at, responded_at, responded_by_role"
    )
    .single();

  if (error || !data) {
    return {
      error: error?.message ?? "Unable to update team invite."
    };
  }

  return {
    data: mapTeamInviteRowToInvite(data as TeamInviteRow)
  };
}
