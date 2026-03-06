import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const publicDir = path.join(projectRoot, "public");
const envPath = path.join(projectRoot, ".env");

async function loadEnvFile(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) return;

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^['"]|['"]$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Add it to web/.env or export it before running this script.`);
  }
  return value;
}

function contentTypeForFile(fileName) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpeg") || lower.endsWith(".jpg")) return "image/jpeg";
  return "application/octet-stream";
}

function buildPublicUrl(supabaseUrl, bucket, storagePath) {
  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

async function uploadAsset({ supabaseUrl, supabaseKey, bucket, storagePath, fileBuffer, contentType }) {
  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${encodedPath}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
      "content-type": contentType,
      "x-upsert": "true"
    },
    body: fileBuffer
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to upload ${storagePath}: ${response.status} ${errorBody}`);
  }
}

async function main() {
  await loadEnvFile(envPath);

  const supabaseUrl = requireEnv("VITE_SUPABASE_URL");
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    requireEnv("VITE_SUPABASE_ANON_KEY");
  const bucket = process.env.VITE_SUPABASE_MEDIA_BUCKET || "media";

  const assetNames = (await fs.readdir(publicDir)).sort();
  const uploadedAssets = [];

  for (const assetName of assetNames) {
    const localPath = path.join(publicDir, assetName);
    const fileStats = await fs.stat(localPath);
    if (!fileStats.isFile()) continue;

    const fileBuffer = await fs.readFile(localPath);
    const storagePath = `seed/public/${assetName}`;
    await uploadAsset({
      supabaseUrl,
      supabaseKey,
      bucket,
      storagePath,
      fileBuffer,
      contentType: contentTypeForFile(assetName)
    });
    uploadedAssets.push({
      assetName,
      storagePath,
      publicUrl: buildPublicUrl(supabaseUrl, bucket, storagePath)
    });
  }

  process.stdout.write(`${JSON.stringify(uploadedAssets, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
