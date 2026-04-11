import { PlayerCard } from "@/components/cards/PlayerCard";
import { TeamCard } from "@/components/cards/TeamCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { getAccountPathForRole } from "@/lib/roleRouting";
import { getSchoolName, getTeamName } from "@/lib/selectors";

export function PlayerProfilePage() {
  const { selectedUserId } = useAuthStore();
  const { data } = useDataStore();

  const player = data.players.find((entry) => entry.id === selectedUserId);
  if (!player) {
    return <EmptyState description="Player profile not found for this account." title="Player not found" />;
  }

  const teammateList = data.players.filter((entry) => player.teammateIds.includes(entry.id));
  const teams = data.teams.filter((team) => player.teamIds.includes(team.id));
  const accountPath = getAccountPathForRole("player");

  return (
    <div>
      <PageHeader
        description="Your profile details, active teams, and linked teammates."
        title={`${player.firstName} ${player.lastName}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section className="space-y-6">
          <PlayerCard
            editTo={accountPath}
            player={player}
            teamNames={player.teamIds.map((teamId) => getTeamName(data, teamId))}
            variant="profile"
          />

          <div>
            <h2 className="mb-3 text-lg font-semibold">Active Teams</h2>
            {teams.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    playerCount={team.playerIds.length}
                    schoolName={getSchoolName(data, team.schoolId)}
                    team={team}
                  />
                ))}
              </div>
            ) : (
              <EmptyState description="This profile is not linked to any teams yet." title="No teams" />
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Linked Teammates</h2>
          {teammateList.length ? (
            <div className="space-y-3">
              {teammateList.map((teammate) => (
                <PlayerCard
                  key={teammate.id}
                  player={teammate}
                  teamNames={teammate.teamIds.map((teamId) => getTeamName(data, teamId))}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              description="No linked teammates are configured for this player."
              title="No teammates"
            />
          )}
        </section>
      </div>
    </div>
  );
}
