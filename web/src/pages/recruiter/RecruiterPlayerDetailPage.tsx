import { useParams } from "react-router-dom";
import { PlayerCard } from "@/components/cards/PlayerCard";
import { ClipCard } from "@/components/cards/ClipCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { getTeamName } from "@/lib/selectors";
import { useDataStore } from "@/store/dataStore";
import { useRecruiterStore } from "@/store/recruiterStore";

export function RecruiterPlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const { data } = useDataStore();
  const { favoritePlayerIds, savedClipIds, toggleFavoritePlayer, toggleSavedClip } = useRecruiterStore();

  const player = data.players.find((entry) => entry.id === playerId);
  if (!player || player.privacy !== "public") {
    return (
      <EmptyState
        description="Private profiles are completely hidden from recruiter views."
        title="Player unavailable"
      />
    );
  }

  const clips = data.clips.filter((clip) => clip.playerId === player.id);
  const isFavorite = favoritePlayerIds.includes(player.id);

  return (
    <div>
      <PageHeader description="Recruiter view for a public player profile." title="Player Profile" />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <PlayerCard
          actionLabel={isFavorite ? "Unfavorite" : "Favorite"}
          actionVariant={isFavorite ? "secondary" : "outline"}
          onAction={() => toggleFavoritePlayer(player.id)}
          player={player}
          teamNames={player.teamIds.map((teamId) => getTeamName(data, teamId))}
        />

        <section>
          <h2 className="mb-3 text-lg font-semibold">Public Clips</h2>
          {clips.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {clips.map((clip) => (
                <ClipCard
                  canSave
                  clip={clip}
                  isSaved={savedClipIds.includes(clip.id)}
                  key={clip.id}
                  onToggleSave={() => toggleSavedClip(clip.id)}
                  playerName={`${player.firstName} ${player.lastName}`}
                />
              ))}
            </div>
          ) : (
            <EmptyState description="No clips are available for this player." title="No clips" />
          )}
        </section>
      </div>
    </div>
  );
}
