import { GameCard } from "@/components/cards/GameCard";
import { TournamentCard } from "@/components/cards/TournamentCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { getTeamName } from "@/lib/selectors";

export function PlayerSchedulePage() {
  const { selectedUserId } = useAuthStore();
  const { data } = useDataStore();

  const player = data.players.find((entry) => entry.id === selectedUserId);
  if (!player) {
    return <EmptyState description="Select a valid player demo user." title="Player not found" />;
  }

  const games = data.games.filter((game) =>
    player.teamIds.includes(game.homeTeamId) || player.teamIds.includes(game.awayTeamId)
  );

  const tournaments = data.tournaments.filter((tournament) =>
    tournament.gameIds.some((gameId) => games.some((game) => game.id === gameId))
  );

  return (
    <div>
      <PageHeader
        description="Games and tournaments across all teams you are linked to."
        title="Schedule"
      />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Games</h2>
        {games.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {games.map((game) => (
              <GameCard
                awayTeamName={getTeamName(data, game.awayTeamId)}
                game={game}
                homeTeamName={getTeamName(data, game.homeTeamId)}
                key={game.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState description="No linked games were found." title="No games" />
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Tournaments</h2>
        {tournaments.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        ) : (
          <EmptyState description="No tournaments linked to your games yet." title="No tournaments" />
        )}
      </section>
    </div>
  );
}
