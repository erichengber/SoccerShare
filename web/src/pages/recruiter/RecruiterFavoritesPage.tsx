import { PlayerCard } from "@/components/cards/PlayerCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { getTeamName } from "@/lib/selectors";
import { useDataStore } from "@/store/dataStore";
import { useRecruiterStore } from "@/store/recruiterStore";

export function RecruiterFavoritesPage() {
  const { data } = useDataStore();
  const { favoritePlayerIds, toggleFavoritePlayer } = useRecruiterStore();

  const players = data.players.filter(
    (player) => favoritePlayerIds.includes(player.id) && player.privacy === "public"
  );

  return (
    <div>
      <PageHeader description="Your shortlist of public player profiles." title="Favorited Players" />

      {players.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <PlayerCard
              actionLabel="Remove Favorite"
              key={player.id}
              linkTo={`/recruiter/players/${player.id}`}
              onAction={() => toggleFavoritePlayer(player.id)}
              player={player}
              teamNames={player.teamIds.map((teamId) => getTeamName(data, teamId))}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          description="Favorite players from the recruiter browser or game pages."
          title="No favorites yet"
        />
      )}
    </div>
  );
}
