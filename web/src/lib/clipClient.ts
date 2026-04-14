import { resolveSeededPublicAssetUrl } from "@/lib/mediaClient";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Clip } from "@/types/domain";

interface ClipRow {
  id: string;
  player_id: string;
  title: string;
  video_url: string;
  poster_url: string | null;
  duration_sec: number;
  tags: string[] | null;
  notes: string | null;
  game_id: string | null;
  tournament_id: string | null;
  created_at: string;
}

interface ClipClientResult<T> {
  data?: T;
  error?: string;
}

function normalizeClipAssetUrl(url: string | null) {
  if (!url) return undefined;
  if (!url.startsWith("/")) return url;
  return resolveSeededPublicAssetUrl(url);
}

function mapClipRowToClip(row: ClipRow): Clip {
  return {
    id: row.id,
    playerId: row.player_id,
    title: row.title,
    videoUrl: normalizeClipAssetUrl(row.video_url) ?? row.video_url,
    posterUrl: normalizeClipAssetUrl(row.poster_url),
    durationSec: row.duration_sec,
    tags: (row.tags ?? []) as Clip["tags"],
    notes: row.notes ?? "",
    gameId: row.game_id ?? undefined,
    tournamentId: row.tournament_id ?? undefined,
    createdAt: row.created_at
  };
}

function mapClipToRow(clip: Clip): ClipRow {
  return {
    id: clip.id,
    player_id: clip.playerId,
    title: clip.title,
    video_url: clip.videoUrl,
    poster_url: clip.posterUrl ?? null,
    duration_sec: clip.durationSec,
    tags: clip.tags,
    notes: clip.notes,
    game_id: clip.gameId ?? null,
    tournament_id: clip.tournamentId ?? null,
    created_at: clip.createdAt
  };
}

export async function fetchClipsFromSupabase(): Promise<ClipClientResult<Clip[]>> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      data: []
    };
  }

  const { data, error } = await supabase
    .from("clips")
    .select(
      "id, player_id, title, video_url, poster_url, duration_sec, tags, notes, game_id, tournament_id, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return {
      error: error.message
    };
  }

  return {
    data: (data as ClipRow[]).map(mapClipRowToClip)
  };
}

export async function upsertClipInSupabase(clip: Clip): Promise<ClipClientResult<Clip>> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      data: clip
    };
  }

  const { data, error } = await supabase
    .from("clips")
    .upsert(mapClipToRow(clip), {
      onConflict: "id"
    })
    .select(
      "id, player_id, title, video_url, poster_url, duration_sec, tags, notes, game_id, tournament_id, created_at"
    )
    .single();

  if (error || !data) {
    return {
      error: error?.message ?? "Unable to save clip in Supabase."
    };
  }

  return {
    data: mapClipRowToClip(data as ClipRow)
  };
}
