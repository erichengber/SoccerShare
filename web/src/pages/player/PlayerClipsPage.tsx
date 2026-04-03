import { ClipCard } from "@/components/cards/ClipCard";
import { UploadClipModal } from "@/components/modals/UploadClipModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { useUIStore } from "@/store/uiStore";

export function PlayerClipsPage() {
  const { selectedUserId } = useAuthStore();
  const { data, uploadClip } = useDataStore();
  const { isUploadModalOpen, uploadTargetPlayerId, openUploadModal, closeUploadModal } = useUIStore();

  const player = data.players.find((entry) => entry.id === selectedUserId);
  if (!player) {
    return <EmptyState description="Player profile not found for this account." title="Player not found" />;
  }

  const clips = data.clips.filter((clip) => clip.playerId === player.id);

  return (
    <div>
      <PageHeader
        action={<Button onClick={() => openUploadModal(player.id)}>Upload Clip</Button>}
        description="Manage your highlight library and open any clip to edit tags/notes."
        title="Clip Library"
      />

      {clips.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {clips.map((clip) => (
            <ClipCard
              clip={clip}
              key={clip.id}
              linkTo={`/player/clips/${clip.id}`}
              playerName={`${player.firstName} ${player.lastName}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          description="Use the upload action to add your first highlight clip."
          title="No clips yet"
        />
      )}

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
