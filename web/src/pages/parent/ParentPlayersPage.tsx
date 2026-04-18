import { useEffect, useState } from "react";
import { PlayerCard } from "@/components/cards/PlayerCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { getTeamName } from "@/lib/selectors";

export function ParentPlayersPage() {
  const { selectedUserId } = useAuthStore();
  const {
    data,
    playerDirectory,
    playerDirectoryInitialized,
    playerDirectoryLoading,
    playerDirectorySyncError,
    updateParentProfile
  } = useDataStore();
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [linkMessage, setLinkMessage] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  const parent = data.parents.find((entry) => entry.id === selectedUserId);
  if (!parent) {
    return <EmptyState description="Parent profile not found for this account." title="Parent not found" />;
  }

  const players = data.players.filter((player) => parent.playerIds.includes(player.id));
  const selectablePlayers = playerDirectory.filter((player) => !parent.playerIds.includes(player.id));
  const isPlayerDirectoryPending = !playerDirectoryInitialized || playerDirectoryLoading;

  useEffect(() => {
    if (!selectablePlayers.length) {
      setSelectedPlayerId("");
      return;
    }

    if (!selectablePlayers.some((player) => player.id === selectedPlayerId)) {
      setSelectedPlayerId(selectablePlayers[0].id);
    }
  }, [selectablePlayers, selectedPlayerId]);

  return (
    <div>
      <PageHeader
        description="Review linked players and add more athletes to this parent account."
        title="Your Players"
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Link Another Player</CardTitle>
          <CardDescription>Add another player to this parent account after onboarding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Select
              disabled={isPlayerDirectoryPending || !selectablePlayers.length || isLinking}
              onValueChange={setSelectedPlayerId}
              value={selectedPlayerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select player to link" />
              </SelectTrigger>
              <SelectContent>
                {selectablePlayers.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.firstName} {player.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={!selectedPlayerId || isPlayerDirectoryPending || isLinking}
              onClick={async () => {
                setLinkMessage(null);
                setIsLinking(true);

                try {
                  const result = await updateParentProfile({
                    parentId: parent.id,
                    avatarUrl: parent.avatarUrl,
                    playerId: selectedPlayerId
                  });
                  setLinkMessage(result.success ? "Player linked to this parent account." : result.error ?? "Unable to link player.");
                } finally {
                  setIsLinking(false);
                }
              }}
              type="button"
            >
              {isLinking ? "Linking..." : "Link Player"}
            </Button>
          </div>

          {isPlayerDirectoryPending ? (
            <p className="text-sm text-muted-foreground">Loading players from the database...</p>
          ) : null}
          {!isPlayerDirectoryPending && playerDirectorySyncError ? (
            <p className="text-sm text-amber-700">
              Could not fully refresh the player directory from Supabase. Showing the currently available list.
            </p>
          ) : null}
          {!isPlayerDirectoryPending && !selectablePlayers.length ? (
            <p className="text-sm text-muted-foreground">All available players are already linked to this parent account.</p>
          ) : null}
          {linkMessage ? <p className="text-sm text-muted-foreground">{linkMessage}</p> : null}
        </CardContent>
      </Card>

      {players.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              linkTo={`/parent/players/${player.id}`}
              player={player}
              teamNames={player.teamIds.map((teamId) => getTeamName(data, teamId))}
            />
          ))}
        </div>
      ) : (
        <EmptyState description="No players linked to this parent account." title="No linked players" />
      )}
    </div>
  );
}
