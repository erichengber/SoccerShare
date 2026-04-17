import { ClipCard } from "@/components/cards/ClipCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDataStore } from "@/store/dataStore";
import { useRecruiterStore } from "@/store/recruiterStore";

export function RecruiterAllClipsPage() {
  const { data } = useDataStore();
  const { savedClipIds, toggleSavedClip } = useRecruiterStore();

  // Get all clips from public players, sorted by creation date
  const clips = data.clips
    .filter((clip) => {
      const player = data.players.find((entry) => entry.id === clip.playerId);
      return player?.privacy === "public";
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <PageHeader
        description="Browse all clips from public player profiles."
        title="All Player Clips"
      />

      {clips.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clips.map((clip) => {
            const player = data.players.find((entry) => entry.id === clip.playerId);
            const playerName = player ? `${player.firstName} ${player.lastName}` : "Unknown Player";

            return (
              <ClipCard
                canSave
                clip={clip}
                isSaved={savedClipIds.includes(clip.id)}
                key={clip.id}
                linkTo={`/recruiter/clips/${clip.id}`}
                onToggleSave={() => toggleSavedClip(clip.id)}
                playerName={playerName}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState description="No clips available from public player profiles." title="No clips found" />
      )}
    </div>
  );
}
