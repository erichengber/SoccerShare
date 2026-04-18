import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Parent, Player } from "@/types/domain";

interface FamilyClientResult<T> {
  data?: T;
  error?: string;
}

interface PlayerRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  grad_year: number | null;
  position: Player["position"] | null;
  jersey_number: number | null;
  team_ids: string[] | null;
  parent_ids: string[] | null;
  teammate_ids: string[] | null;
  privacy: Player["privacy"] | null;
  bio: string | null;
}

interface ParentRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  player_ids: string[] | null;
}

interface UpsertPlayerPayload {
  player: Player;
}

interface UpsertParentPayload {
  parent: Parent;
}

function supabaseConfigError() {
  return "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or VITE_SUPABASE_ANON_KEY).";
}

function mapPlayerRowToPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    role: "player",
    firstName: row.first_name?.trim() || "New",
    lastName: row.last_name?.trim() || "Player",
    email: row.email?.trim().toLowerCase() || "",
    avatarUrl: row.avatar_url?.trim() || "",
    gradYear: row.grad_year ?? new Date().getFullYear() + 2,
    position: row.position ?? "Central Midfielder",
    jerseyNumber: row.jersey_number ?? 0,
    teamIds: row.team_ids ?? [],
    parentIds: row.parent_ids ?? [],
    teammateIds: row.teammate_ids ?? [],
    privacy: row.privacy ?? "public",
    bio: row.bio ?? ""
  };
}

function mapParentRowToParent(row: ParentRow): Parent {
  return {
    id: row.id,
    role: "parent",
    firstName: row.first_name?.trim() || "New",
    lastName: row.last_name?.trim() || "Parent",
    email: row.email?.trim().toLowerCase() || "",
    avatarUrl: row.avatar_url?.trim() || "",
    playerIds: row.player_ids ?? []
  };
}

export async function fetchPlayersFromSupabase(): Promise<FamilyClientResult<Player[]>> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      data: []
    };
  }

  const { data, error } = await supabase
    .from("players")
    .select(
      "id, first_name, last_name, email, avatar_url, grad_year, position, jersey_number, team_ids, parent_ids, teammate_ids, privacy, bio"
    )
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (error) {
    return {
      error: error.message
    };
  }

  return {
    data: (data as PlayerRow[]).map(mapPlayerRowToPlayer)
  };
}

export async function fetchPlayerFromSupabase(playerId: string): Promise<FamilyClientResult<Player>> {
  if (!isSupabaseConfigured || !supabase) {
    return {};
  }

  const { data, error } = await supabase
    .from("players")
    .select(
      "id, first_name, last_name, email, avatar_url, grad_year, position, jersey_number, team_ids, parent_ids, teammate_ids, privacy, bio"
    )
    .eq("id", playerId)
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
    data: mapPlayerRowToPlayer(data as PlayerRow)
  };
}

export async function fetchPlayersByIdsFromSupabase(playerIds: string[]): Promise<FamilyClientResult<Player[]>> {
  if (!isSupabaseConfigured || !supabase || playerIds.length === 0) {
    return {
      data: []
    };
  }

  const { data, error } = await supabase
    .from("players")
    .select(
      "id, first_name, last_name, email, avatar_url, grad_year, position, jersey_number, team_ids, parent_ids, teammate_ids, privacy, bio"
    )
    .in("id", playerIds)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (error) {
    return {
      error: error.message
    };
  }

  return {
    data: (data as PlayerRow[]).map(mapPlayerRowToPlayer)
  };
}

export async function fetchParentFromSupabase(parentId: string): Promise<FamilyClientResult<Parent>> {
  if (!isSupabaseConfigured || !supabase) {
    return {};
  }

  const { data, error } = await supabase
    .from("parents")
    .select("id, first_name, last_name, email, avatar_url, player_ids")
    .eq("id", parentId)
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
    data: mapParentRowToParent(data as ParentRow)
  };
}

export async function upsertPlayerInSupabase(
  payload: UpsertPlayerPayload
): Promise<FamilyClientResult<{ id: string }>> {
  if (!supabase) {
    return { error: supabaseConfigError() };
  }

  const { player } = payload;
  const { data, error } = await supabase
    .from("players")
    .upsert({
      id: player.id,
      role: "player",
      first_name: player.firstName.trim(),
      last_name: player.lastName.trim(),
      email: player.email.trim().toLowerCase(),
      avatar_url: player.avatarUrl.trim(),
      grad_year: player.gradYear,
      position: player.position,
      jersey_number: player.jerseyNumber,
      team_ids: player.teamIds,
      parent_ids: player.parentIds,
      teammate_ids: player.teammateIds,
      privacy: player.privacy,
      bio: player.bio
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      error: error?.message ?? "Unable to save player in Supabase."
    };
  }

  return { data: { id: data.id as string } };
}

export async function upsertParentInSupabase(
  payload: UpsertParentPayload
): Promise<FamilyClientResult<{ id: string }>> {
  if (!supabase) {
    return { error: supabaseConfigError() };
  }

  const { parent } = payload;
  const { data, error } = await supabase
    .from("parents")
    .upsert({
      id: parent.id,
      role: "parent",
      first_name: parent.firstName.trim(),
      last_name: parent.lastName.trim(),
      email: parent.email.trim().toLowerCase(),
      avatar_url: parent.avatarUrl.trim(),
      player_ids: parent.playerIds
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      error: error?.message ?? "Unable to save parent in Supabase."
    };
  }

  return { data: { id: data.id as string } };
}
