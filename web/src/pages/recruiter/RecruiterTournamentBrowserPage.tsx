import { Navigate } from "react-router-dom";
import { PlayerCard } from "@/components/cards/PlayerCard";
import { TournamentCard } from "@/components/cards/TournamentCard";
import { FiltersPanel } from "@/components/filters/FiltersPanel";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { filterRecruiterPlayers, getTeamName } from "@/lib/selectors";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { useRecruiterStore } from "@/store/recruiterStore";
import { useUIStore } from "@/store/uiStore";

export function RecruiterTournamentBrowserPage() {
  const { selectedUserId } = useAuthStore();
  const { data } = useDataStore();
  const { recruiterFilters, resetRecruiterFilters, setRecruiterFilters } = useUIStore();
  const { favoritePlayerIds, toggleFavoritePlayer } = useRecruiterStore();
  const recruiter = data.recruiters.find((entry) => entry.id === selectedUserId);

  if (!recruiter) {
    return <EmptyState description="Select a valid recruiter demo user." title="Recruiter not found" />;
  }

  if (!recruiter.organization.trim() || !recruiter.region.trim()) {
    return <Navigate replace to="/onboarding/recruiter" />;
  }

  const filteredPlayers = filterRecruiterPlayers(data, recruiterFilters);
  const gradYears = [...new Set(data.players.map((player) => player.gradYear))].sort((a, b) => a - b);

  return (
    <div>
      <PageHeader
        description="Browse tournaments first, then evaluate public players and clips."
        title="Tournament Browser"
      />

      <FiltersPanel
        filters={recruiterFilters}
        gradYears={gradYears}
        onChange={setRecruiterFilters}
        onReset={resetRecruiterFilters}
        teams={data.teams}
        tournaments={data.tournaments}
      />

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Tournaments</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.tournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              linkTo={`/recruiter/tournaments/${tournament.id}`}
              tournament={tournament}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Filtered Public Players</h2>
        {filteredPlayers.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPlayers.map((player) => {
              const isFavorite = favoritePlayerIds.includes(player.id);
              return (
                <PlayerCard
                  actionLabel={isFavorite ? "Unfavorite" : "Favorite"}
                  actionVariant={isFavorite ? "secondary" : "outline"}
                  key={player.id}
                  linkTo={`/recruiter/players/${player.id}`}
                  onAction={() => toggleFavoritePlayer(player.id)}
                  player={player}
                  teamNames={player.teamIds.map((teamId) => getTeamName(data, teamId))}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            description="No public players match the current filter combination."
            title="No players found"
          />
        )}
      </section>
    </div>
  );
}
