import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { VideoPlayer } from "@/components/shared/VideoPlayer";
import { TagBadgeList } from "@/components/shared/TagBadgeList";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CLIP_TAGS } from "@/constants/domain";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import type { ClipTag } from "@/types/domain";

export function ClipDetailPage() {
  const { clipId } = useParams<{ clipId: string }>();
  const { selectedUserId } = useAuthStore();
  const { data, updateClip } = useDataStore();

  const player = data.players.find((entry) => entry.id === selectedUserId);
  const clip = data.clips.find((entry) => entry.id === clipId && entry.playerId === selectedUserId);

  const game = data.games.find((entry) => entry.id === clip?.gameId);
  const tournament = data.tournaments.find((entry) => entry.id === clip?.tournamentId);

  const [selectedTags, setSelectedTags] = useState<ClipTag[]>(clip?.tags ?? []);
  const [notes, setNotes] = useState(clip?.notes ?? "");

  const canSave = useMemo(() => {
    if (!clip) return false;
    const tagsChanged = selectedTags.join("|") !== clip.tags.join("|");
    const notesChanged = notes !== clip.notes;
    return tagsChanged || notesChanged;
  }, [clip, notes, selectedTags]);

  if (!player || !clip) {
    return <EmptyState description="Clip was not found for this player account." title="Clip not found" />;
  }

  function toggleTag(tag: ClipTag, checked: boolean) {
    setSelectedTags((prev) => (checked ? [...prev, tag] : prev.filter((entry) => entry !== tag)));
  }

  return (
    <div>
      <PageHeader
        action={
          <Button asChild variant="outline">
            <Link to="/player/clips">
              <ArrowLeft className="h-4 w-4" />
              Back to clips
            </Link>
          </Button>
        }
        description="Review playback and update clip metadata in memory."
        title={clip.title}
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="space-y-4">
          <VideoPlayer posterUrl={clip.posterUrl} src={clip.videoUrl} />
          <Card>
            <CardHeader>
              <CardTitle>Current Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <TagBadgeList tags={clip.tags} />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Linked Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Game: {game ? `${game.location} (${new Date(game.date).toLocaleDateString()})` : "None"}</p>
              <p>Tournament: {tournament?.name ?? "None"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Edit Clip Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {CLIP_TAGS.map((tag) => (
                  <label className="flex items-center gap-2 text-sm" htmlFor={`edit-tag-${tag}`} key={tag}>
                    <Checkbox
                      checked={selectedTags.includes(tag)}
                      id={`edit-tag-${tag}`}
                      onCheckedChange={(checked) => toggleTag(tag, checked === true)}
                    />
                    {tag}
                  </label>
                ))}
              </div>
              <Textarea onChange={(event) => setNotes(event.target.value)} value={notes} />
              <Button
                disabled={!canSave}
                onClick={() => {
                  updateClip({ clipId: clip.id, tags: selectedTags, notes });
                }}
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
