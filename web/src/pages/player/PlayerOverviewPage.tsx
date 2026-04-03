import { Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ClipCard } from "@/components/cards/ClipCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { getTeamName } from "@/lib/selectors";

export function PlayerOverviewPage() {
  const { selectedUserId } = useAuthStore();
  const { data, respondToTeamInvite } = useDataStore();
  const [inviteMessage, setInviteMessage] = useState<string>();

  const player = data.players.find((entry) => entry.id === selectedUserId);

  if (!player) {
    return <EmptyState description="Select a valid player demo user." title="Player not found" />;
  }

  if (!player.teamIds.length || !player.bio.trim()) {
    return <Navigate replace to="/onboarding/player" />;
  }

  const clips = data.clips.filter((clip) => clip.playerId === player.id);
  const recentClips = clips.slice(0, 3);

  const relatedGames = data.games.filter((game) =>
    player.teamIds.includes(game.homeTeamId) || player.teamIds.includes(game.awayTeamId)
  );
  const pendingInvites = data.teamInvites.filter(
    (invite) => invite.playerId === player.id && invite.status === "pending"
  );

  return (
    <div>
      <PageHeader
        action={
          <Button asChild>
            <Link to="/player/clips">View all clips</Link>
          </Button>
        }
        description="Your development snapshot across club and school teams."
        title={`Welcome, ${player.firstName}`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Clips Uploaded</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{clips.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{player.teamIds.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Upcoming Games</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{relatedGames.length}</p>
          </CardContent>
        </Card>
      </div>

      {pendingInvites.length ? (
        <section className="mt-6 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Team Invites</h2>
            <Badge variant="secondary">{pendingInvites.length} pending</Badge>
          </div>
          <div className="mt-3 space-y-3">
            {pendingInvites.map((invite) => {
              const teamName = getTeamName(data, invite.teamId);
              return (
                <div className="rounded-lg border p-3" key={invite.id}>
                  <p className="text-sm font-medium">{teamName}</p>
                  <p className="text-xs text-muted-foreground">
                    Invite sent {new Date(invite.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={async () => {
                        const result = await respondToTeamInvite({
                          inviteId: invite.id,
                          responderRole: "player",
                          responderId: player.id,
                          accept: true
                        });
                        setInviteMessage(result.success ? "Invite accepted." : result.error ?? "Unable to respond.");
                      }}
                      size="sm"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={async () => {
                        const result = await respondToTeamInvite({
                          inviteId: invite.id,
                          responderRole: "player",
                          responderId: player.id,
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Recent Clips</h2>
          {recentClips.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {recentClips.map((clip) => (
                <ClipCard
                  clip={clip}
                  key={clip.id}
                  linkTo={`/player/clips/${clip.id}`}
                  playerName={`${player.firstName} ${player.lastName}`}
                />
              ))}
            </div>
          ) : (
            <EmptyState description="Upload your first highlight to get started." title="No clips yet" />
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Current Teams</h2>
          <div className="space-y-3">
            {player.teamIds.map((teamId) => (
              <Card key={teamId}>
                <CardContent className="p-4">
                  <p className="font-medium">{getTeamName(data, teamId)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
