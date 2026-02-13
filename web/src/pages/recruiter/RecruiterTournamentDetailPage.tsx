import { useParams } from "react-router-dom";
import { GameCard } from "@/components/cards/GameCard";
import { TeamCard } from "@/components/cards/TeamCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { getSchoolName, getTeamName } from "@/lib/selectors";
import { useDataStore } from "@/store/dataStore";

export function RecruiterTournamentDetailPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { data } = useDataStore();

  const tournament = data.tournaments.find((entry) => entry.id === tournamentId);
  if (!tournament) {
    return <EmptyState description="Tournament not found in demo data." title="Tournament not found" />;
  }

  const games = data.games.filter((game) => tournament.gameIds.includes(game.id));
  const teamIds = [...new Set(games.flatMap((game) => [game.homeTeamId, game.awayTeamId]))];
  const teams = data.teams.filter((team) => teamIds.includes(team.id));

  return (
    <div>
      <PageHeader
        description={`${tournament.location} • ${new Date(tournament.startDate).toLocaleDateString()} - ${new Date(
          tournament.endDate
        ).toLocaleDateString()}`}
        title={tournament.name}
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
                linkTo={`/recruiter/games/${game.id}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState description="No games are linked to this tournament." title="No games" />
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Teams in Tournament</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              playerCount={team.playerIds.length}
              schoolName={getSchoolName(data, team.schoolId)}
              team={team}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
