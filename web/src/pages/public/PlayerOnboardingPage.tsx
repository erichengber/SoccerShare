import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PLAYER_POSITIONS } from "@/constants/domain";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import type { PlayerPosition } from "@/types/domain";

export function PlayerOnboardingPage() {
  const navigate = useNavigate();
  const { selectedUserId, markOnboardingComplete } = useAuthStore();
  const { data, completePlayerOnboarding } = useDataStore();
  const player = data.players.find((entry) => entry.id === selectedUserId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [position, setPosition] = useState<PlayerPosition>(player?.position ?? PLAYER_POSITIONS[0]);
  const [jerseyNumber, setJerseyNumber] = useState<string>(String(player?.jerseyNumber ?? ""));
  const [teamId, setTeamId] = useState<string>(player?.teamIds[0] ?? data.teams[0]?.id ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string>(player?.avatarUrl ?? "");
  const [bio, setBio] = useState<string>(player?.bio ?? "");
  const [error, setError] = useState<string | null>(null);

  if (!selectedUserId || !player) {
    return null;
  }
  const playerId = selectedUserId;
  const avatarInitials = `${player.firstName[0] ?? ""}${player.lastName[0] ?? ""}`.toUpperCase();

  async function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile picture must be 5MB or smaller.");
      return;
    }

    // Supabase handoff note:
    // - Replace FileReader data URL with upload to Supabase Storage (e.g., `avatars` bucket).
    // - Store returned public/signed URL in `avatarUrl`.
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = () => reject(new Error("Unable to read file."));
      reader.readAsDataURL(file);
    }).catch(() => "");

    if (!dataUrl) {
      setError("Unable to process image. Try a different file.");
      return;
    }

    setAvatarUrl(dataUrl);
    setError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsedJerseyNumber = Number(jerseyNumber);

    // Supabase handoff note:
    // - Replace local store mutation with a persisted mutation to your `profiles`/`players` table.
    // - Keep these fields aligned with DB columns: `position`, `jersey_number`, `team_id`, `bio`, `avatar_url`.
    const result = completePlayerOnboarding({
      playerId,
      position,
      jerseyNumber: parsedJerseyNumber,
      teamId,
      bio,
      avatarUrl
    });

    if (!result.success) {
      setError(result.error ?? "Unable to save onboarding details.");
      return;
    }

    markOnboardingComplete(playerId);
    navigate("/player");
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Player Profile</CardTitle>
            <CardDescription>
              Add your position, jersey number, team, and player summary to finish setup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center gap-3">
                <button
                  className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  {avatarUrl ? (
                    <img
                      alt={`${player.firstName} ${player.lastName}`}
                      className="h-full w-full object-cover"
                      src={avatarUrl}
                    />
                  ) : (
                    <span className="text-lg font-semibold text-slate-600">{avatarInitials}</span>
                  )}
                </button>
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                  ref={fileInputRef}
                  type="file"
                />
                <Button onClick={() => fileInputRef.current?.click()} type="button" variant="outline">
                  Upload Profile Picture
                </Button>
                <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP. Max file size 5MB.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="player-position">Position</Label>
                  <Select onValueChange={(value) => setPosition(value as PlayerPosition)} value={position}>
                    <SelectTrigger id="player-position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAYER_POSITIONS.map((entry) => (
                        <SelectItem key={entry} value={entry}>
                          {entry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jersey-number">Jersey number</Label>
                  <Input
                    id="jersey-number"
                    inputMode="numeric"
                    max={99}
                    min={0}
                    onChange={(event) => setJerseyNumber(event.target.value)}
                    required
                    type="number"
                    value={jerseyNumber}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="player-team">Team</Label>
                <Select onValueChange={setTeamId} value={teamId}>
                  <SelectTrigger id="player-team">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="player-summary">Profile summary</Label>
                <Textarea
                  id="player-summary"
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Describe your playing style, strengths, and goals."
                  required
                  rows={5}
                  value={bio}
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button className="w-full" type="submit">
                Save and Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
