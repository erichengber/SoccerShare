import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const MEDIA_BUCKET = import.meta.env.VITE_SUPABASE_MEDIA_BUCKET || "media";
const SEEDED_PUBLIC_PREFIX = "seed/public";

interface UploadedMediaAsset {
  path: string;
  url: string;
}

interface UploadedClipMedia {
  video: UploadedMediaAsset;
  poster?: UploadedMediaAsset;
}

function buildFileExtension(file: File) {
  const extensionFromName = file.name.split(".").pop()?.trim().toLowerCase();
  if (extensionFromName) {
    return extensionFromName;
  }

  if (file.type === "video/quicktime") return "mov";
  if (file.type === "video/webm") return "webm";
  if (file.type === "video/mp4") return "mp4";
  if (file.type === "image/png") return "png";
  return "jpg";
}

function getPublicUrl(path: string) {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or VITE_SUPABASE_ANON_KEY)."
    );
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function uploadAsset(path: string, file: File): Promise<UploadedMediaAsset> {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or VITE_SUPABASE_ANON_KEY)."
    );
  }

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: false
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    path,
    url: getPublicUrl(path)
  };
}

export function resolveSeededPublicAssetUrl(localPublicPath: string) {
  if (!isSupabaseConfigured) {
    return localPublicPath;
  }

  const assetName = localPublicPath.split("/").pop();
  if (!assetName) {
    return localPublicPath;
  }

  return getPublicUrl(`${SEEDED_PUBLIC_PREFIX}/${assetName}`);
}

export async function uploadClipMedia(params: {
  clipId: string;
  playerId: string;
  videoFile: File;
  posterFile?: File;
}): Promise<UploadedClipMedia> {
  const { clipId, playerId, posterFile, videoFile } = params;

  const video = await uploadAsset(
    `clips/${playerId}/${clipId}/video.${buildFileExtension(videoFile)}`,
    videoFile
  );
  const poster = posterFile
    ? await uploadAsset(
        `clips/${playerId}/${clipId}/poster.${buildFileExtension(posterFile)}`,
        posterFile
      )
    : undefined;

  return {
    video,
    poster
  };
}
