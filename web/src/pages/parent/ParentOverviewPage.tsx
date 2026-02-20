import { Link } from "react-router-dom";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { getTeamName } from "@/lib/selectors";

export function ParentOverviewPage() {
  const { selectedUserId } = useAuthStore();
  const { data, respondToTeamInvite } = useDataStore();
  const [inviteMessage, setInviteMessage] = useState<string>();

  const parent = data.parents.find((entry) => entry.id === selectedUserId);
  if (!parent) {
    return <EmptyState description="Select a valid parent demo user." title="Parent not found" />;
  }

  const players = data.players.filter((player) => parent.playerIds.includes(player.id));
  const clipsCount = data.clips.filter((clip) => parent.playerIds.includes(clip.playerId)).length;
  const pendingInvites = data.teamInvites.filter(
    (invite) => invite.status === "pending" && parent.playerIds.includes(invite.playerId)
  );

  return (
    <div>
      <PageHeader
        action={
          <Button asChild>
            <Link to="/parent/players">Manage Players</Link>
          </Button>
        }
        description="Follow your linked athletes and contribute clips."
        title={`Welcome, ${parent.firstName}`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Linked Players</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{players.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Clips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{clipsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Private Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {players.filter((player) => player.privacy === "private").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {pendingInvites.length ? (
        <section className="mt-6 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pending Team Invites</h2>
            <Badge variant="secondary">{pendingInvites.length}</Badge>
          </div>
          <div className="mt-3 space-y-3">
            {pendingInvites.map((invite) => {
              const player = data.players.find((entry) => entry.id === invite.playerId);
              return (
                <div className="rounded-lg border p-3" key={invite.id}>
                  <p className="text-sm font-medium">
                    {player ? `${player.firstName} ${player.lastName}` : invite.playerId}
                  </p>
                  <p className="text-xs text-muted-foreground">{getTeamName(data, invite.teamId)}</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={() => {
                        const result = respondToTeamInvite({
                          inviteId: invite.id,
                          responderRole: "parent",
                          responderId: parent.id,
                          accept: true
                        });
                        setInviteMessage(result.success ? "Invite accepted." : result.error ?? "Unable to respond.");
                      }}
                      size="sm"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => {
                        const result = respondToTeamInvite({
                          inviteId: invite.id,
                          responderRole: "parent",
                          responderId: parent.id,
                          accept: false
                        });
                        setInviteMessage(result.success ? "Invite declined." : result.error ?? "Unable to respond.");
                      }}
                      size="sm"
                      variant="outline"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              );
            })}
            {inviteMessage ? <p className="text-sm text-muted-foreground">{inviteMessage}</p> : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
