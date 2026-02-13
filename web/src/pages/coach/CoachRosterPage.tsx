import { PlayerCard } from "@/components/cards/PlayerCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { getTeamName } from "@/lib/selectors";

export function CoachRosterPage() {
  const { selectedUserId } = useAuthStore();
  const { data } = useDataStore();

  const coach = data.coaches.find((entry) => entry.id === selectedUserId);
  if (!coach) {
    return <EmptyState description="Select a valid coach demo user." title="Coach not found" />;
  }

  const roster = data.players.filter((player) => player.teamIds.includes(coach.teamId));

  return (
    <div>
      <PageHeader description="Private and public players on your linked roster." title="Team Roster" />

      {roster.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roster.map((player) => (
            <PlayerCard
              key={player.id}
              linkTo={`/coach/players/${player.id}`}
              player={player}
              teamNames={player.teamIds.map((teamId) => getTeamName(data, teamId))}
            />
          ))}
        </div>
      ) : (
        <EmptyState description="No players are linked to this coach's team." title="No players" />
      )}
    </div>
  );
}
