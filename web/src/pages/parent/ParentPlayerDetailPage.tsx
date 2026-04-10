import { useState } from "react";
import { useParams } from "react-router-dom";
import { PlayerCard } from "@/components/cards/PlayerCard";
import { ClipCard } from "@/components/cards/ClipCard";
import { UploadClipModal } from "@/components/modals/UploadClipModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { useUIStore } from "@/store/uiStore";
import { getTeamName } from "@/lib/selectors";

export function ParentPlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const { selectedUserId } = useAuthStore();
  const { data, setPlayerPrivacy, uploadClip } = useDataStore();
  const { isUploadModalOpen, uploadTargetPlayerId, openUploadModal, closeUploadModal } = useUIStore();

  const parent = data.parents.find((entry) => entry.id === selectedUserId);
  if (!parent) {
    return <EmptyState description="Parent profile not found for this account." title="Parent not found" />;
  }

  const player = data.players.find((entry) => entry.id === playerId && parent.playerIds.includes(entry.id));
  if (!player) {
    return <EmptyState description="This player is not linked to the active parent account." title="No access" />;
  }

  const clips = data.clips.filter((clip) => clip.playerId === player.id);
  const isPublic = player.privacy === "public";
  const [privacyMessage, setPrivacyMessage] = useState<string>();

  return (
    <div>
      <PageHeader
        action={<Button onClick={() => openUploadModal(player.id)}>Upload Clip</Button>}
        description="Parents can upload highlights for linked players regardless of privacy setting."
        title={`${player.firstName} ${player.lastName}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <PlayerCard player={player} teamNames={player.teamIds.map((teamId) => getTeamName(data, teamId))} />

        <section>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                Player Visibility
                <Badge>{isPublic ? "Public" : "Private"}</Badge>
              </CardTitle>
              <CardDescription>Parents control who can discover this player profile.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                disabled={isPublic}
                onClick={async () => {
                  const result = await setPlayerPrivacy(player.id, "public");
                  setPrivacyMessage(
                    result.success ? "Player profile is now public." : result.error ?? "Unable to update privacy."
                  );
                }}
                size="sm"
              >
                Set Public
              </Button>
              <Button
                disabled={!isPublic}
                onClick={async () => {
                  const result = await setPlayerPrivacy(player.id, "private");
                  setPrivacyMessage(
                    result.success ? "Player profile is now private." : result.error ?? "Unable to update privacy."
                  );
                }}
                size="sm"
                variant="outline"
              >
                Set Private
              </Button>
              {privacyMessage ? <p className="w-full text-sm text-muted-foreground">{privacyMessage}</p> : null}
            </CardContent>
          </Card>

          <h2 className="mb-3 text-lg font-semibold">Clips</h2>
          {clips.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {clips.map((clip) => (
                <ClipCard
                  clip={clip}
                  key={clip.id}
                  playerName={`${player.firstName} ${player.lastName}`}
                />
              ))}
            </div>
          ) : (
            <EmptyState description="No clips uploaded for this player yet." title="No clips" />
          )}
        </section>
      </div>

      {isUploadModalOpen && uploadTargetPlayerId === player.id ? (
        <UploadClipModal
          games={data.games}
          onOpenChange={(open) => {
            if (!open) closeUploadModal();
          }}
          onSubmit={uploadClip}
          open={isUploadModalOpen}
          player={player}
          tournaments={data.tournaments}
        />
      ) : null}
    </div>
  );
}
