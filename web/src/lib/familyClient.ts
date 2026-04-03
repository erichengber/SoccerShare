import { supabase } from "@/lib/supabase";
import type { Player, Parent } from "@/types/domain";

interface FamilyClientResult<T> {
  data?: T;
  error?: string;
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
