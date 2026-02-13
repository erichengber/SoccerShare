import { TeamCard } from "@/components/cards/TeamCard";
import { ClipCard } from "@/components/cards/ClipCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { getSchoolName } from "@/lib/selectors";

export function CoachOverviewPage() {
  const { selectedUserId } = useAuthStore();
  const { data } = useDataStore();

  const coach = data.coaches.find((entry) => entry.id === selectedUserId);
  if (!coach) {
    return <EmptyState description="Select a valid coach demo user." title="Coach not found" />;
  }

  const team = data.teams.find((entry) => entry.id === coach.teamId);
  if (!team) {
    return <EmptyState description="No team linked to this coach account." title="Team not found" />;
  }

  const roster = data.players.filter((player) => player.teamIds.includes(team.id));
  const recentClips = data.clips.filter((clip) => roster.some((player) => player.id === clip.playerId)).slice(0, 6);

  return (
    <div>
      <PageHeader description="Team-level performance snapshot." title={`Coach Dashboard: ${team.name}`} />

      <div className="grid gap-4 md:grid-cols-3">
        <TeamCard
          playerCount={roster.length}
          schoolName={getSchoolName(data, team.schoolId)}
          team={team}
        />
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Roster Players</p>
          <p className="mt-1 text-3xl font-semibold">{roster.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Team Clips</p>
          <p className="mt-1 text-3xl font-semibold">{recentClips.length}</p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Recent Roster Clips</h2>
        {recentClips.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentClips.map((clip) => {
              const player = roster.find((entry) => entry.id === clip.playerId);
              return (
                <ClipCard
                  clip={clip}
                  key={clip.id}
                  playerName={player ? `${player.firstName} ${player.lastName}` : "Unknown Player"}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState description="No clips found for this team yet." title="No clips" />
        )}
      </section>
    </div>
  );
}
