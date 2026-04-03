import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { BookmarkCheck, MapPinned, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";

const recruiterSignals = [
  {
    icon: Search,
    title: "Scout with context",
    description: "Browse tournaments, filter public athletes, and review clips without losing the story around a player."
  },
  {
    icon: BookmarkCheck,
    title: "Build a shortlist",
    description: "Save clips and favorite profiles so follow-up stays organized across events and age groups."
  },
  {
    icon: MapPinned,
    title: "Stay region-aware",
    description: "Set your recruiting footprint up front so the workspace feels tailored to your coverage area."
  }
];

export function RecruiterOnboardingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, selectedRole, selectedUserId } = useAuthStore();
  const { data, completeRecruiterOnboarding } = useDataStore();
  const recruiter = data.recruiters.find((entry) => entry.id === selectedUserId);

  const [avatarUrl, setAvatarUrl] = useState(recruiter?.avatarUrl ?? "");
  const [organization, setOrganization] = useState(recruiter?.organization ?? "");
  const [region, setRegion] = useState(recruiter?.region ?? "");
  const [error, setError] = useState<string | null>(null);

  if (selectedRole !== "recruiter" || !selectedUserId || !recruiter) {
    return <Navigate replace to="/" />;
  }

  if (recruiter.organization.trim() && recruiter.region.trim()) {
    return <Navigate replace to="/recruiter" />;
  }

  const recruiterId = recruiter.id;
  const recruiterFirstName = recruiter.firstName;
  const recruiterLastName = recruiter.lastName;
  const recruiterEmail = recruiter.email;
  const initials = `${recruiter.firstName[0] ?? ""}${recruiter.lastName[0] ?? ""}`.toUpperCase();

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

    const result = await completeRecruiterOnboarding({
      recruiterId,
      avatarUrl,
      organization,
      region,
      firstName:
        typeof user?.user_metadata?.first_name === "string" ? user.user_metadata.first_name : recruiterFirstName,
      lastName:
        typeof user?.user_metadata?.last_name === "string" ? user.user_metadata.last_name : recruiterLastName,
      email: user?.email ?? recruiterEmail
    });

    if (!result.success) {
      setError(result.error ?? "Unable to finish recruiter onboarding.");
      return;
    }

    navigate("/recruiter");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#f0fdf4_46%,_#f8fafc_100%)] px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <section className="overflow-hidden rounded-[32px] border border-emerald-200/70 bg-emerald-950 text-white shadow-[0_30px_100px_-50px_rgba(6,78,59,0.9)]">
          <div className="border-b border-white/10 px-6 py-8 md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">Recruiter Setup</p>
            <h1 className="mt-4 max-w-lg text-4xl font-semibold tracking-tight md:text-5xl">
              Set your recruiting identity before you start scouting.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-emerald-100/80">
              Add your organization, region, and profile image so your saved players and clips live inside a
              workspace that feels ready for real evaluation.
            </p>
          </div>

          <div className="grid gap-4 px-6 py-6 md:px-8 md:py-8">
            {recruiterSignals.map(({ icon: Icon, title, description }) => (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5" key={title}>
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-emerald-400/15 p-3 text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-emerald-100/75">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Card className="border-emerald-100/90 bg-white/90 shadow-[0_30px_80px_-45px_rgba(5,150,105,0.4)] backdrop-blur">
          <CardContent className="p-6 md:p-8">
            <div className="mb-8">
              <p className="text-sm font-medium text-emerald-700">Step 1 of 1</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Complete recruiter onboarding</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Tell SoccerShare who you recruit for and what region you cover, then you can jump into tournaments.
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
                    <img alt={`${recruiter.firstName} ${recruiter.lastName}`} className="h-full w-full object-cover" src={avatarUrl} />
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
                  <p className="text-sm font-medium text-slate-900">Recruiter profile photo</p>
                  <p className="text-xs text-slate-500">PNG, JPG, or WEBP. Max file size 5MB.</p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()} type="button" variant="outline">
                  Upload Photo
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recruiter-organization">Organization</Label>
                <Input
                  id="recruiter-organization"
                  onChange={(event) => setOrganization(event.target.value)}
                  placeholder="e.g. Great Lakes University Soccer"
                  required
                  value={organization}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recruiter-region">Recruiting region</Label>
                <Input
                  id="recruiter-region"
                  onChange={(event) => setRegion(event.target.value)}
                  placeholder="e.g. Midwest, Southeast, National"
                  required
                  value={region}
                />
              </div>

              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                Once this is saved, you will land in the recruiter tournament browser with your profile ready to use.
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
