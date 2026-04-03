import { PlayerCard } from "@/components/cards/PlayerCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { getTeamName } from "@/lib/selectors";

export function ParentPlayersPage() {
  const { selectedUserId } = useAuthStore();
  const { data } = useDataStore();

  const parent = data.parents.find((entry) => entry.id === selectedUserId);
  if (!parent) {
    return <EmptyState description="Parent profile not found for this account." title="Parent not found" />;
  }

  const players = data.players.filter((player) => parent.playerIds.includes(player.id));

  return (
    <div>
      <PageHeader
        description="Select a linked player to review profile, clips, and upload highlights."
        title="Your Players"
      />

      {players.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              linkTo={`/parent/players/${player.id}`}
              player={player}
              teamNames={player.teamIds.map((teamId) => getTeamName(data, teamId))}
            />
          ))}
        </div>
      ) : (
        <EmptyState description="No players linked to this parent account." title="No linked players" />
      )}
    </div>
  );
}
