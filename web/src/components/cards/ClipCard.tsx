import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { TagBadgeList } from "@/components/shared/TagBadgeList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { Clip } from "@/types/domain";

interface ClipCardProps {
  clip: Clip;
  playerName: string;
  linkTo?: string;
  canSave?: boolean;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export function ClipCard({
  clip,
  playerName,
  linkTo,
  canSave = false,
  isSaved = false,
  onToggleSave
}: ClipCardProps) {
  return (
    <Card className="overflow-hidden">
      {clip.posterUrl ? (
        <img alt={clip.title} className="h-44 w-full object-cover" src={clip.posterUrl} />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
          No preview image
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{clip.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{playerName}</p>
          </div>
          <Badge variant="outline">{clip.durationSec}s</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <TagBadgeList tags={clip.tags} />
        <p className="line-clamp-2 text-sm text-muted-foreground">{clip.notes}</p>
        <p className="text-xs text-muted-foreground">Added {formatDate(clip.createdAt)}</p>
        <div className="flex gap-2">
          {linkTo ? (
            <Button asChild className="flex-1" size="sm">
              <Link to={linkTo}>Open Clip</Link>
            </Button>
          ) : null}
          {canSave && onToggleSave ? (
            <Button className="flex-1" onClick={onToggleSave} size="sm" variant="outline">
              {isSaved ? (
                <>
                  <BookmarkCheck className="h-4 w-4" /> Saved
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" /> Save
                </>
              )}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
