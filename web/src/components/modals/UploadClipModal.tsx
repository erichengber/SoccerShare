import { useMemo, useState } from "react";
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
import type { ClipTag, ClipUploadInput, Game, Player, SampleVideoOption, Tournament } from "@/types/domain";

interface UploadClipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player;
  games: Game[];
  tournaments: Tournament[];
  sampleVideos: SampleVideoOption[];
  onSubmit: (input: ClipUploadInput) => void;
}

export function UploadClipModal({
  open,
  onOpenChange,
  player,
  games,
  tournaments,
  sampleVideos,
  onSubmit
}: UploadClipModalProps) {
  const [title, setTitle] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState(sampleVideos[0]?.id ?? "");
  const [customVideoUrl, setCustomVideoUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [durationSec, setDurationSec] = useState(20);
  const [selectedTags, setSelectedTags] = useState<ClipTag[]>([]);
  const [notes, setNotes] = useState("");
  const [gameId, setGameId] = useState<string>();
  const [tournamentId, setTournamentId] = useState<string>();

  const selectedSampleVideo = useMemo(
    () => sampleVideos.find((entry) => entry.id === selectedVideoId),
    [sampleVideos, selectedVideoId]
  );

  function toggleTag(tag: ClipTag, checked: boolean) {
    setSelectedTags((prev) => (checked ? [...prev, tag] : prev.filter((entry) => entry !== tag)));
  }

  function resetForm() {
    setTitle("");
    setSelectedVideoId(sampleVideos[0]?.id ?? "");
    setCustomVideoUrl("");
    setPosterUrl("");
    setDurationSec(20);
    setSelectedTags([]);
    setNotes("");
    setGameId(undefined);
    setTournamentId(undefined);
  }

  function handleSubmit() {
    const videoUrl = customVideoUrl.trim() || selectedSampleVideo?.url;
    if (!videoUrl || !title.trim() || selectedTags.length === 0) return;

    onSubmit({
      playerId: player.id,
      title: title.trim(),
      videoUrl,
      posterUrl: posterUrl.trim() || selectedSampleVideo?.posterUrl,
      durationSec,
      tags: selectedTags,
      notes: notes.trim(),
      gameId,
      tournamentId
    });

    resetForm();
    onOpenChange(false);
  }

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
            Select a sample video or paste your own URL, then attach tags and optional game/tournament links.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clip-title">Title</Label>
            <Input id="clip-title" onChange={(event) => setTitle(event.target.value)} value={title} />
          </div>

          <div className="space-y-2">
            <Label>Sample video</Label>
            <Select onValueChange={setSelectedVideoId} value={selectedVideoId}>
              <SelectTrigger>
                <SelectValue placeholder="Select sample video" />
              </SelectTrigger>
              <SelectContent>
                {sampleVideos.map((video) => (
                  <SelectItem key={video.id} value={video.id}>
                    {video.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-video-url">Custom video URL (optional)</Label>
            <Input
              id="custom-video-url"
              onChange={(event) => setCustomVideoUrl(event.target.value)}
              placeholder="https://...mp4"
              value={customVideoUrl}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="poster-url">Poster URL (optional)</Label>
              <Input
                id="poster-url"
                onChange={(event) => setPosterUrl(event.target.value)}
                placeholder="https://...jpg"
                value={posterUrl}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
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
          <Button onClick={handleSubmit}>Save Clip</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
