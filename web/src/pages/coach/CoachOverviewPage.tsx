import { useState } from "react";
import { Navigate } from "react-router-dom";
import { TeamCard } from "@/components/cards/TeamCard";
import { ClipCard } from "@/components/cards/ClipCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { TEAM_LEVELS } from "@/constants/domain";
import { capitalize } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { getSchoolName } from "@/lib/selectors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TeamLevel } from "@/types/domain";

export function CoachOverviewPage() {
  const { selectedUserId } = useAuthStore();
  const { data, createCoachTeam } = useDataStore();
  const [teamName, setTeamName] = useState("");
  const [level, setLevel] = useState<TeamLevel>("club");
  const [schoolId, setSchoolId] = useState("none");
  const [createMessage, setCreateMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const coach = data.coaches.find((entry) => entry.id === selectedUserId);
  if (!coach) {
    return <EmptyState description="Select a valid coach demo user." title="Coach not found" />;
  }
  const coachId = coach.id;

  if (!coach.teamId) {
    return <Navigate replace to="/onboarding/coach" />;
  }

  const team = data.teams.find((entry) => entry.id === coach.teamId);
  const roster = team ? data.players.filter((player) => player.teamIds.includes(team.id)) : [];
  const recentClips = team
    ? data.clips.filter((clip) => roster.some((player) => player.id === clip.playerId)).slice(0, 6)
    : [];

  async function handleCreateTeam() {
    setCreateMessage(undefined);
    setIsSubmitting(true);

    const result = await createCoachTeam(coachId, {
      name: teamName,
      level,
      schoolId: schoolId === "none" ? undefined : schoolId
    });

    setIsSubmitting(false);
    setCreateMessage(result.success ? "Team created and linked to your coach account." : result.error);
    if (result.success) {
      setTeamName("");
    }
  }

  return (
    <div>
      <PageHeader
        description="Team-level performance snapshot and team creation."
        title={team ? `Coach Dashboard: ${team.name}` : "Coach Dashboard"}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create New Team</CardTitle>
          <CardDescription>
            Create and link a brand new team to this coach account through Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="team-name">Team name</Label>
            <Input
              id="team-name"
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="e.g. Northside United 2011"
              value={teamName}
            />
          </div>

          <div className="space-y-2">
            <Label>Team level</Label>
            <Select onValueChange={(value) => setLevel(value as TeamLevel)} value={level}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_LEVELS.map((entry) => (
                  <SelectItem key={entry} value={entry}>
                    {capitalize(entry)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>School (optional)</Label>
            <Select onValueChange={setSchoolId} value={schoolId}>
              <SelectTrigger>
                <SelectValue placeholder="Independent team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Independent team</SelectItem>
                {data.schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Button disabled={isSubmitting || !teamName.trim()} onClick={handleCreateTeam}>
              {isSubmitting ? "Creating..." : team ? "Create and Switch Team" : "Create Team"}
            </Button>
            {createMessage ? <p className="mt-2 text-sm text-muted-foreground">{createMessage}</p> : null}
          </div>
        </CardContent>
      </Card>

      {team ? (
        <>
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
        </>
      ) : (
        <EmptyState
          description="This coach does not have a linked team yet. Create one above to unlock roster and schedule tools."
          title="No team linked"
        />
      )}
    </div>
  );
}
