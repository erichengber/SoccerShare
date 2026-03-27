import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TEAM_LEVELS } from "@/constants/domain";
import { capitalize } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import type { TeamLevel } from "@/types/domain";

const onboardingSignals = [
  {
    icon: Users,
    title: "Organize your roster",
    description: "Create your squad, link athletes, and keep everyone working from the same team hub."
  },
  {
    icon: Target,
    title: "Track development",
    description: "Collect clips and game context in one place so feedback stays clear and actionable."
  },
  {
    icon: ShieldCheck,
    title: "Share with confidence",
    description: "Manage team access while still giving families and recruiters the right visibility."
  }
];

export function CoachOnboardingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, selectedRole, selectedUserId } = useAuthStore();
  const { data, completeCoachOnboarding } = useDataStore();
  const coach = data.coaches.find((entry) => entry.id === selectedUserId);

  const [avatarUrl, setAvatarUrl] = useState(coach?.avatarUrl ?? "");
  const [teamName, setTeamName] = useState("");
  const [level, setLevel] = useState<TeamLevel>("club");
  const [schoolId, setSchoolId] = useState("none");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (selectedRole !== "coach" || !selectedUserId || !coach) {
    return <Navigate replace to="/" />;
  }

  if (coach.teamId) {
    return <Navigate replace to="/coach" />;
  }

  const coachId = coach.id;
  const coachFirstName = coach.firstName;
  const coachLastName = coach.lastName;
  const coachEmail = coach.email;
  const initials = `${coach.firstName[0] ?? ""}${coach.lastName[0] ?? ""}`.toUpperCase();

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
    setIsSubmitting(true);

    try {
      const result = await completeCoachOnboarding({
        coachId,
        avatarUrl,
        teamName,
        level,
        schoolId: schoolId === "none" ? undefined : schoolId,
        firstName:
          typeof user?.user_metadata?.first_name === "string" ? user.user_metadata.first_name : coachFirstName,
        lastName:
          typeof user?.user_metadata?.last_name === "string" ? user.user_metadata.last_name : coachLastName,
        email: user?.email ?? coachEmail
      });

      if (!result.success) {
        setError(result.error ?? "Unable to finish coach onboarding.");
        return;
      }

      navigate("/coach");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#ecfeff_48%,_#f8fafc_100%)] px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-slate-950 text-white shadow-[0_30px_100px_-50px_rgba(15,23,42,0.85)]">
          <div className="border-b border-white/10 px-6 py-8 md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Coach Setup</p>
            <h1 className="mt-4 max-w-lg text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Launch your team workspace before the next whistle.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              Build the coaching profile families will recognize, create your team, and unlock the roster
              tools waiting on the other side.
            </p>
          </div>

          <div className="grid gap-4 px-6 py-6 md:px-8 md:py-8">
            {onboardingSignals.map(({ icon: Icon, title, description }) => (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5" key={title}>
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-300">
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

        <Card className="border-slate-200/90 bg-white/90 shadow-[0_30px_80px_-45px_rgba(14,116,144,0.45)] backdrop-blur">
          <CardContent className="p-6 md:p-8">
            <div className="mb-8">
              <p className="text-sm font-medium text-cyan-700">Step 1 of 1</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Complete coach onboarding</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add your profile photo and create the first team linked to this coach account.
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
                    <img alt={`${coach.firstName} ${coach.lastName}`} className="h-full w-full object-cover" src={avatarUrl} />
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
                  <p className="text-sm font-medium text-slate-900">Coach profile photo</p>
                  <p className="text-xs text-slate-500">PNG, JPG, or WEBP. Max file size 5MB.</p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()} type="button" variant="outline">
                  Upload Photo
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coach-team-name">Team name</Label>
                <Input
                  disabled={isSubmitting}
                  id="coach-team-name"
                  onChange={(event) => setTeamName(event.target.value)}
                  placeholder="e.g. South City Storm 2012"
                  required
                  value={teamName}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="coach-team-level">Team level</Label>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={(value) => setLevel(value as TeamLevel)}
                    value={level}
                  >
                    <SelectTrigger id="coach-team-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_LEVELS.map((entry) => (
                        <SelectItem key={entry} value={entry}>
                          {capitalize(entry)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coach-school">School affiliation</Label>
                  <Select disabled={isSubmitting} onValueChange={setSchoolId} value={schoolId}>
                    <SelectTrigger id="coach-school">
                      <SelectValue placeholder="Independent team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Independent team</SelectItem>
                      {data.schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                SoccerShare will create your team, attach it to this coach profile, and open your coach dashboard.
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
                {isSubmitting ? "Setting up your team..." : "Finish Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
