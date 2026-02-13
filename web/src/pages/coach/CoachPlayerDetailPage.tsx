import { useParams } from "react-router-dom";
import { ClipCard } from "@/components/cards/ClipCard";
import { PlayerCard } from "@/components/cards/PlayerCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { getTeamName } from "@/lib/selectors";

export function CoachPlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const { selectedUserId } = useAuthStore();
  const { data } = useDataStore();

  const coach = data.coaches.find((entry) => entry.id === selectedUserId);
  if (!coach) {
    return <EmptyState description="Select a valid coach demo user." title="Coach not found" />;
  }

  const player = data.players.find((entry) => entry.id === playerId && entry.teamIds.includes(coach.teamId));
  if (!player) {
    return <EmptyState description="You can only view players on your own roster." title="No access" />;
  }

  const clips = data.clips.filter((clip) => clip.playerId === player.id);

  return (
    <div>
      <PageHeader description="Coach access includes private players linked to your team." title="Player Profile" />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <PlayerCard player={player} teamNames={player.teamIds.map((teamId) => getTeamName(data, teamId))} />

        <section>
          <h2 className="mb-3 text-lg font-semibold">Player Clips</h2>
          {clips.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {clips.map((clip) => (
                <ClipCard
                  clip={clip}
                  key={clip.id}
                  playerName={`${player.firstName} ${player.lastName}`}
                />
              ))}
            </div>
          ) : (
            <EmptyState description="No clips added for this player." title="No clips" />
          )}
        </section>
      </div>
    </div>
  );
}
