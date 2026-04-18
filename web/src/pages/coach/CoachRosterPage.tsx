import { useEffect, useState } from "react";
import { PlayerCard } from "@/components/cards/PlayerCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { getTeamName } from "@/lib/selectors";

export function CoachRosterPage() {
  const { selectedUserId } = useAuthStore();
  const { data, invitePlayerToTeam } = useDataStore();
  const [selectedInvitePlayerId, setSelectedInvitePlayerId] = useState<string>("");
  const [inviteMessage, setInviteMessage] = useState<string>();

  const coach = data.coaches.find((entry) => entry.id === selectedUserId);
  if (!coach) {
    return <EmptyState description="Coach profile not found for this account." title="Coach not found" />;
  }
  if (!coach.teamId) {
    return (
      <EmptyState
        description="Create a team from Coach Overview before inviting players or managing roster."
        title="No team linked"
      />
    );
  }
  const coachTeamId = coach.teamId;

  const roster = data.players.filter((player) => player.teamIds.includes(coachTeamId));
  const pendingInvites = data.teamInvites.filter(
    (invite) => invite.teamId === coachTeamId && invite.status === "pending"
  );
  const inviteCandidates = data.players.filter(
    (player) =>
      !player.teamIds.includes(coachTeamId) &&
      !pendingInvites.some((invite) => invite.playerId === player.id)
  );

  useEffect(() => {
    if (!inviteCandidates.length) {
      setSelectedInvitePlayerId("");
      return;
    }

    if (!inviteCandidates.some((player) => player.id === selectedInvitePlayerId)) {
      setSelectedInvitePlayerId(inviteCandidates[0].id);
    }
  }, [inviteCandidates, selectedInvitePlayerId]);

  return (
    <div>
      <PageHeader description="Private and public players on your linked roster." title="Team Roster" />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Invite Player to Team</CardTitle>
          <CardDescription>Send a roster invite that the player accepts from their own dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {inviteCandidates.length ? (
            <>
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Select onValueChange={setSelectedInvitePlayerId} value={selectedInvitePlayerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select player to invite" />
                  </SelectTrigger>
                  <SelectContent>
                    {inviteCandidates.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.firstName} {player.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={!selectedInvitePlayerId}
                  onClick={async () => {
                    const result = await invitePlayerToTeam(coach.id, selectedInvitePlayerId);
                    setInviteMessage(result.success ? "Invite sent." : result.error ?? "Unable to send invite.");
                  }}
                >
                  Send Invite
                </Button>
              </div>
              {inviteMessage ? <p className="text-sm text-muted-foreground">{inviteMessage}</p> : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">All available players are already on this team.</p>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Pending Invites</p>
            {pendingInvites.length ? (
              <div className="flex flex-wrap gap-2">
                {pendingInvites.map((invite) => {
                  const player = data.players.find((entry) => entry.id === invite.playerId);
                  return (
                    <Badge key={invite.id} variant="secondary">
                      {player ? `${player.firstName} ${player.lastName}` : invite.playerId}
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pending invites.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {roster.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roster.map((player) => (
            <PlayerCard
              key={player.id}
              linkTo={`/coach/players/${player.id}`}
              player={player}
              teamNames={player.teamIds.map((teamId) => getTeamName(data, teamId))}
            />
          ))}
        </div>
      ) : (
        <EmptyState description="No players are linked to this coach's team." title="No players" />
      )}
    </div>
  );
}
