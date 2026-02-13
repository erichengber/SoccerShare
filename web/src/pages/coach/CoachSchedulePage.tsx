import { GameCard } from "@/components/cards/GameCard";
import { TournamentCard } from "@/components/cards/TournamentCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { getTeamName } from "@/lib/selectors";

export function CoachSchedulePage() {
  const { selectedUserId } = useAuthStore();
  const { data } = useDataStore();

  const coach = data.coaches.find((entry) => entry.id === selectedUserId);
  if (!coach) {
    return <EmptyState description="Select a valid coach demo user." title="Coach not found" />;
  }

  const games = data.games.filter(
    (game) => game.homeTeamId === coach.teamId || game.awayTeamId === coach.teamId
  );

  const tournaments = data.tournaments.filter((tournament) =>
    tournament.gameIds.some((gameId) => games.some((game) => game.id === gameId))
  );

  return (
    <div>
      <PageHeader description="Upcoming and linked tournament matches for your team." title="Team Schedule" />

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
          <EmptyState description="No games are on this team schedule yet." title="No games" />
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
          <EmptyState description="No tournaments linked for this team yet." title="No tournaments" />
        )}
      </section>
    </div>
  );
}
