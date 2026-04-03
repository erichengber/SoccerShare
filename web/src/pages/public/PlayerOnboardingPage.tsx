import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PLAYER_POSITIONS } from "@/constants/domain";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import type { PlayerPosition } from "@/types/domain";

const playerSignals = [
  {
    icon: Sparkles,
    title: "Shape your first impression",
    description: "Add the essentials recruiters, parents, and coaches need when they open your profile."
  },
  {
    icon: Compass,
    title: "Anchor your soccer identity",
    description: "Set your position, jersey number, and team so your highlights have the right context."
  },
  {
    icon: ShieldCheck,
    title: "Start with a complete profile",
    description: "A polished summary and photo make the rest of your clips and updates feel intentional."
  }
];

export function PlayerOnboardingPage() {
  const navigate = useNavigate();
  const { user, selectedUserId } = useAuthStore();
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
  const playerFirstName = player.firstName;
  const playerLastName = player.lastName;
  const playerEmail = player.email;
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsedJerseyNumber = Number(jerseyNumber);

    const result = await completePlayerOnboarding({
      playerId,
      position,
      jerseyNumber: parsedJerseyNumber,
      teamId,
      bio,
      avatarUrl,
      firstName:
        typeof user?.user_metadata?.first_name === "string" ? user.user_metadata.first_name : playerFirstName,
      lastName:
        typeof user?.user_metadata?.last_name === "string" ? user.user_metadata.last_name : playerLastName,
      email: user?.email ?? playerEmail
    });

    if (!result.success) {
      setError(result.error ?? "Unable to save onboarding details.");
      return;
    }
    navigate("/player");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eff6ff_46%,_#f8fafc_100%)] px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <section className="overflow-hidden rounded-[32px] border border-sky-200/70 bg-slate-950 text-white shadow-[0_30px_100px_-50px_rgba(15,23,42,0.9)]">
          <div className="border-b border-white/10 px-6 py-8 md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">Player Setup</p>
            <h1 className="mt-4 max-w-lg text-4xl font-semibold tracking-tight md:text-5xl">
              Build the profile people see before they watch the first clip.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              Add your role, team context, and a short summary so SoccerShare starts with a profile that feels real and ready.
            </p>
          </div>

          <div className="grid gap-4 px-6 py-6 md:px-8 md:py-8">
            {playerSignals.map(({ icon: Icon, title, description }) => (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5" key={title}>
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-sky-400/15 p-3 text-sky-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Card className="border-sky-100/90 bg-white/90 shadow-[0_30px_80px_-45px_rgba(14,165,233,0.42)] backdrop-blur">
          <CardContent className="p-6 md:p-8">
            <div className="mb-8">
              <p className="text-sm font-medium text-sky-700">Step 1 of 1</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Complete player onboarding</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add your photo, position, team, and profile summary to finish setting up your account.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-6 text-center">
                <button
                  className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-sm"
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
                    <span className="text-2xl font-semibold text-slate-600">{avatarInitials}</span>
                  )}
                </button>
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                  ref={fileInputRef}
                  type="file"
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900">Player profile photo</p>
                  <p className="text-xs text-slate-500">PNG, JPG, or WEBP. Max file size 5MB.</p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()} type="button" variant="outline">
                  Upload Photo
                </Button>
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

              <Button className="w-full" size="lg" type="submit">
                Finish Setup
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
