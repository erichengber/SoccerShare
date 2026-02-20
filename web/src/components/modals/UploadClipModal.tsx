import { useEffect, useRef, useState } from "react";
import { CLIP_TAGS } from "@/constants/domain";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { ClipTag, ClipUploadInput, Game, Player, Tournament } from "@/types/domain";

interface UploadClipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player;
  games: Game[];
  tournaments: Tournament[];
  onSubmit: (input: ClipUploadInput) => void;
}

function formatTime(seconds: number) {
  const safeValue = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeValue / 60);
  const remainingSeconds = safeValue % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function UploadClipModal({
  open,
  onOpenChange,
  player,
  games,
  tournaments,
  onSubmit
}: UploadClipModalProps) {
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const [title, setTitle] = useState("");
  const [fileInputResetKey, setFileInputResetKey] = useState(0);
  const [localVideoFile, setLocalVideoFile] = useState<File>();
  const [localVideoObjectUrl, setLocalVideoObjectUrl] = useState<string>();
  const [posterDataUrl, setPosterDataUrl] = useState<string>();
  const [posterFrameTime, setPosterFrameTime] = useState(0);
  const [videoDurationSec, setVideoDurationSec] = useState(0);
  const [durationSec, setDurationSec] = useState(20);
  const [selectedTags, setSelectedTags] = useState<ClipTag[]>([]);
  const [notes, setNotes] = useState("");
  const [gameId, setGameId] = useState<string>();
  const [tournamentId, setTournamentId] = useState<string>();

  useEffect(() => {
    return () => {
      if (localVideoObjectUrl) {
        URL.revokeObjectURL(localVideoObjectUrl);
      }
    };
  }, [localVideoObjectUrl]);

  function toggleTag(tag: ClipTag, checked: boolean) {
    setSelectedTags((prev) => (checked ? [...prev, tag] : prev.filter((entry) => entry !== tag)));
  }

  function handleVideoFileChange(file: File | undefined) {
    if (localVideoObjectUrl) {
      URL.revokeObjectURL(localVideoObjectUrl);
    }

    if (!file) {
      setLocalVideoFile(undefined);
      setLocalVideoObjectUrl(undefined);
      setPosterDataUrl(undefined);
      setPosterFrameTime(0);
      setVideoDurationSec(0);
      return;
    }

    const nextObjectUrl = URL.createObjectURL(file);
    setLocalVideoFile(file);
    setLocalVideoObjectUrl(nextObjectUrl);
    setPosterDataUrl(undefined);
    setPosterFrameTime(0);
    setVideoDurationSec(0);
  }

  function handleCapturePoster() {
    const video = previewVideoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPosterDataUrl(canvas.toDataURL("image/jpeg", 0.9));
    setPosterFrameTime(video.currentTime || 0);
  }

  function resetForm() {
    if (localVideoObjectUrl) {
      URL.revokeObjectURL(localVideoObjectUrl);
    }

    setTitle("");
    setLocalVideoFile(undefined);
    setLocalVideoObjectUrl(undefined);
    setPosterDataUrl(undefined);
    setPosterFrameTime(0);
    setVideoDurationSec(0);
    setFileInputResetKey((prev) => prev + 1);
    setDurationSec(20);
    setSelectedTags([]);
    setNotes("");
    setGameId(undefined);
    setTournamentId(undefined);
  }

  function handleSubmit() {
    if (!localVideoObjectUrl || !title.trim() || selectedTags.length === 0) return;

    onSubmit({
      playerId: player.id,
      title: title.trim(),
      videoUrl: localVideoObjectUrl,
      posterUrl: posterDataUrl,
      durationSec,
      tags: selectedTags,
      notes: notes.trim(),
      gameId,
      tournamentId
    });

    resetForm();
    onOpenChange(false);
  }

  const canSave = Boolean(localVideoObjectUrl && title.trim() && selectedTags.length);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Clip for {player.firstName}</DialogTitle>
          <DialogDescription>
            Select a video file from your computer, capture a poster frame, then add tags and optional
            game/tournament links.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clip-title">Title</Label>
            <Input id="clip-title" onChange={(event) => setTitle(event.target.value)} value={title} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="local-video-file">Video file</Label>
            <Input
              accept="video/mp4,video/quicktime,video/webm"
              id="local-video-file"
              key={fileInputResetKey}
              onChange={(event) => handleVideoFileChange(event.target.files?.[0])}
              type="file"
            />
            {localVideoFile ? (
              <p className="text-xs text-muted-foreground">Selected file: {localVideoFile.name}</p>
            ) : null}
          </div>

          {localVideoObjectUrl ? (
            <div className="space-y-3 rounded-lg border p-3">
              <div className="space-y-2">
                <Label>Poster Selector</Label>
                <video
                  className="h-56 w-full rounded-md border bg-black object-contain"
                  controls
                  onLoadedMetadata={(event) => {
                    const seconds = Math.max(1, Math.floor(event.currentTarget.duration || 1));
                    setVideoDurationSec(seconds);
                    setDurationSec(seconds);
                  }}
                  ref={previewVideoRef}
                  src={localVideoObjectUrl}
                />
                <p className="text-xs text-muted-foreground">
                  Move to your desired frame in the video, then click capture.
                </p>
                <Button onClick={handleCapturePoster} size="sm" type="button" variant="outline">
                  Capture Current Frame
                </Button>
              </div>

              {posterDataUrl ? (
                <div className="space-y-2">
                  <Label>Selected Poster ({formatTime(posterFrameTime)})</Label>
                  <img
                    alt="Selected poster frame"
                    className="h-40 w-full rounded-md border object-cover"
                    src={posterDataUrl}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                max={videoDurationSec || undefined}
                min={1}
                onChange={(event) => setDurationSec(Math.max(1, Number(event.target.value) || 1))}
                type="number"
                value={durationSec}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attach to game (optional)</Label>
            <Select
              onValueChange={(value) => setGameId(value === "none" ? undefined : value)}
              value={gameId ?? "none"}
            >
              <SelectTrigger>
                <SelectValue placeholder="No game" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No game</SelectItem>
                {games.map((game) => (
                  <SelectItem key={game.id} value={game.id}>
                    {new Date(game.date).toLocaleDateString()} - {game.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Attach to tournament (optional)</Label>
            <Select
              onValueChange={(value) => setTournamentId(value === "none" ? undefined : value)}
              value={tournamentId ?? "none"}
            >
              <SelectTrigger>
                <SelectValue placeholder="No tournament" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No tournament</SelectItem>
                {tournaments.map((tournament) => (
                  <SelectItem key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {CLIP_TAGS.map((tag) => (
                <label className="flex items-center gap-2 text-sm" htmlFor={`tag-${tag}`} key={tag}>
                  <Checkbox
                    checked={selectedTags.includes(tag)}
                    id={`tag-${tag}`}
                    onCheckedChange={(checked) => toggleTag(tag, checked === true)}
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clip-notes">Notes</Label>
            <Textarea id="clip-notes" onChange={(event) => setNotes(event.target.value)} value={notes} />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button disabled={!canSave} onClick={handleSubmit}>
            Save Clip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
