import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { HeartHandshake, Shield, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";

const parentSignals = [
  {
    icon: HeartHandshake,
    title: "Support your athlete",
    description: "Link your player profile so you can follow progress, team invites, and visibility settings."
  },
  {
    icon: Upload,
    title: "Contribute highlights",
    description: "Upload clips on behalf of your player and keep their profile current throughout the season."
  },
  {
    icon: Shield,
    title: "Help manage privacy",
    description: "Parents can work alongside players to decide when a profile should be public or private."
  }
];

export function ParentOnboardingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, selectedRole, selectedUserId } = useAuthStore();
  const { data, completeParentOnboarding } = useDataStore();
  const parent = data.parents.find((entry) => entry.id === selectedUserId);

  const [avatarUrl, setAvatarUrl] = useState(parent?.avatarUrl ?? "");
  const [playerId, setPlayerId] = useState("player-11");
  const [error, setError] = useState<string | null>(null);

  if (selectedRole !== "parent" || !selectedUserId || !parent) {
    return <Navigate replace to="/" />;
  }

  if (parent.playerIds.length > 0) {
    return <Navigate replace to="/parent" />;
  }

  const parentId = parent.id;
  const parentFirstName = parent.firstName;
  const parentLastName = parent.lastName;
  const parentEmail = parent.email;
  const initials = `${parent.firstName[0] ?? ""}${parent.lastName[0] ?? ""}`.toUpperCase();
  const selectablePlayers = data.players;

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

    const result = await completeParentOnboarding({
      parentId,
      avatarUrl,
      playerId,
      firstName:
        typeof user?.user_metadata?.first_name === "string" ? user.user_metadata.first_name : parentFirstName,
      lastName:
        typeof user?.user_metadata?.last_name === "string" ? user.user_metadata.last_name : parentLastName,
      email: user?.email ?? parentEmail
    });

    if (!result.success) {
      setError(result.error ?? "Unable to finish parent onboarding.");
      return;
    }

    navigate("/parent");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_30%),linear-gradient(180deg,_#fffdf7_0%,_#fff7ed_46%,_#ffffff_100%)] px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <section className="overflow-hidden rounded-[32px] border border-amber-200/80 bg-slate-950 text-white shadow-[0_30px_100px_-50px_rgba(120,53,15,0.8)]">
          <div className="border-b border-white/10 px-6 py-8 md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Parent Setup</p>
            <h1 className="mt-4 max-w-lg text-4xl font-semibold tracking-tight md:text-5xl">
              Connect your family account before you jump into player details.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              Add a profile photo and link the athlete you manage so uploads, privacy settings, and invites all live in one place.
            </p>
          </div>

          <div className="grid gap-4 px-6 py-6 md:px-8 md:py-8">
            {parentSignals.map(({ icon: Icon, title, description }) => (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5" key={title}>
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300">
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

        <Card className="border-amber-100/90 bg-white/90 shadow-[0_30px_80px_-45px_rgba(217,119,6,0.4)] backdrop-blur">
          <CardContent className="p-6 md:p-8">
            <div className="mb-8">
              <p className="text-sm font-medium text-amber-700">Step 1 of 1</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Complete parent onboarding</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Choose the player you support and finish setting up your family account.
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
                    <img alt={`${parent.firstName} ${parent.lastName}`} className="h-full w-full object-cover" src={avatarUrl} />
                  ) : (
                    <span className="text-2xl font-semibold text-slate-600">{initials}</span>
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
                  <p className="text-sm font-medium text-slate-900">Parent profile photo</p>
                  <p className="text-xs text-slate-500">PNG, JPG, or WEBP. Max file size 5MB.</p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()} type="button" variant="outline">
                  Upload Photo
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent-player">Linked player</Label>
                <Select onValueChange={setPlayerId} value={playerId}>
                  <SelectTrigger id="parent-player">
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectablePlayers.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.firstName} {player.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                This links your parent account to one player now. You can still manage invites and clips after setup.
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
