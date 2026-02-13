import { ClipCard } from "@/components/cards/ClipCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDataStore } from "@/store/dataStore";
import { useRecruiterStore } from "@/store/recruiterStore";

export function RecruiterSavedClipsPage() {
  const { data } = useDataStore();
  const { savedClipIds, toggleSavedClip } = useRecruiterStore();

  const clips = data.clips.filter((clip) => {
    if (!savedClipIds.includes(clip.id)) return false;
    const player = data.players.find((entry) => entry.id === clip.playerId);
    return player?.privacy === "public";
  });

  return (
    <div>
      <PageHeader description="Your saved clip watchlist across public profiles." title="Saved Clips" />

      {clips.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clips.map((clip) => {
            const player = data.players.find((entry) => entry.id === clip.playerId);
            const playerName = player ? `${player.firstName} ${player.lastName}` : "Unknown Player";

            return (
              <ClipCard
                canSave
                clip={clip}
                isSaved
                key={clip.id}
                onToggleSave={() => toggleSavedClip(clip.id)}
                playerName={playerName}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState description="Save clips from game and player pages to build your shortlist." title="No saved clips" />
      )}
    </div>
  );
}
