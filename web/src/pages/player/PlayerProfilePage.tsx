import { PlayerCard } from "@/components/cards/PlayerCard";
import { TeamCard } from "@/components/cards/TeamCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { getAccountPathForRole } from "@/lib/roleRouting";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { getSchoolName, getTeamName } from "@/lib/selectors";

export function PlayerProfilePage() {
  const { selectedUserId } = useAuthStore();
  const { data } = useDataStore();

  const player = data.players.find((entry) => entry.id === selectedUserId);
  if (!player) {
    return (
      <EmptyState
        description="Select a valid player demo user."
        title="Player not found"
      />
    );
  }

  const teammateList = data.players.filter((entry) =>
    player.teammateIds.includes(entry.id),
  );
  const teams = data.teams.filter((team) => player.teamIds.includes(team.id));
  const accountPath = getAccountPathForRole("player");

  return (
    <div>
      <PageHeader
        description="Your profile details, active teams, and linked teammates."
        title="Profile"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="space-y-6">
          <PlayerCard
            editTo={accountPath}
            player={player}
            showTeams={false}
            teamNames={player.teamIds.map((teamId) =>
              getTeamName(data, teamId),
            )}
            variant="profile"
          />

          <div>
            <h2 className="mb-3 text-lg font-semibold">Teams</h2>
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
          </div>
        </section>

        <section
          aria-labelledby="linked-teammates-heading"
          className="relative lg:pt-8"
        >
          <h2
            className="pointer-events-none absolute left-0 top-0 text-lg font-semibold lg:-top-1"
            id="linked-teammates-heading"
          >
            Teammates
          </h2>
          {teammateList.length ? (
            <div className="space-y-3">
              {teammateList.map((teammate) => (
                <PlayerCard
                  key={teammate.id}
                  player={teammate}
                  teamNames={teammate.teamIds.map((teamId) =>
                    getTeamName(data, teamId),
                  )}
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
