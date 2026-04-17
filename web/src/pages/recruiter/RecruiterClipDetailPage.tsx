import { useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { VideoPlayer } from "@/components/shared/VideoPlayer";
import { TagBadgeList } from "@/components/shared/TagBadgeList";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataStore } from "@/store/dataStore";
import { useRecruiterStore } from "@/store/recruiterStore";
import { Bookmark, BookmarkCheck } from "lucide-react";

export function RecruiterClipDetailPage() {
  const { clipId } = useParams<{ clipId: string }>();
  const { data } = useDataStore();
  const { savedClipIds, toggleSavedClip } = useRecruiterStore();

  const clip = data.clips.find((entry) => entry.id === clipId);
  const player = clip ? data.players.find((entry) => entry.id === clip.playerId) : undefined;

  if (!clip || !player || player.privacy !== "public") {
    return <EmptyState description="Clip was not found or player profile is private." title="Clip not found" />;
  }

  const isSaved = savedClipIds.includes(clip.id);
  const game = data.games.find((entry) => entry.id === clip.gameId);
  const tournament = data.tournaments.find((entry) => entry.id === clip.tournamentId);

  return (
    <div>
      <PageHeader
        action={
          <Button asChild variant="outline">
            <Link to={`/recruiter/players/${player.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to player
            </Link>
          </Button>
        }
        description="Review playback and clip information."
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
              <CardTitle>Player</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Name:</span> {player.firstName} {player.lastName}
              </p>
              <p>
                <span className="font-semibold">Grad Year:</span> {player.gradYear}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clip Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {clip.notes && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">NOTES</p>
                  <p className="text-sm">{clip.notes}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-muted-foreground">DURATION</p>
                <p className="text-sm">{clip.durationSec} seconds</p>
              </div>
              <Button
                className="w-full"
                onClick={() => toggleSavedClip(clip.id)}
                size="sm"
                variant={isSaved ? "default" : "outline"}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4" /> Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" /> Save Clip
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
