import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_ROLES } from "@/constants/domain";
import { getHomePathForRole, getOnboardingPathForRole } from "@/lib/roleRouting";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import type { UserRole } from "@/types/domain";

const roleDescriptions: Record<UserRole, string> = {
  player: "Manage your profile, clips, and schedule.",
  parent: "Support linked athletes, upload clips, and control profile privacy.",
  coach: "Review roster players, clips, and match schedule for your team.",
  recruiter: "Evaluate tournaments, games, and discover public player profiles."
};

export function SelectRolePage() {
  const navigate = useNavigate();
  const { user, isLoading, selectRole } = useAuthStore();
  const { data } = useDataStore();

  const [role, setRole] = useState<UserRole>("player");

  if (!user) {
    return <Navigate replace to="/" />;
  }

  async function handleContinue() {
    const maybeError = await selectRole(role);
    if (maybeError) return;

    const authUserId = useAuthStore.getState().user?.id;
    if (!authUserId) {
      navigate(getHomePathForRole(role));
      return;
    }

    const hasExistingProfile =
      (role === "player" && data.players.some((entry) => entry.id === authUserId)) ||
      (role === "parent" && data.parents.some((entry) => entry.id === authUserId)) ||
      (role === "coach" && data.coaches.some((entry) => entry.id === authUserId)) ||
      (role === "recruiter" && data.recruiters.some((entry) => entry.id === authUserId));

    navigate(hasExistingProfile ? getHomePathForRole(role) : getOnboardingPathForRole(role));
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:px-6">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Select Your Role</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose one role for your authenticated session.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session Role</CardTitle>
            <CardDescription>Exactly one role is active per session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              {USER_ROLES.map((candidateRole) => (
                <button
                  className={`rounded-lg border p-4 text-left transition ${
                    role === candidateRole
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-white hover:bg-muted"
                  }`}
                  key={candidateRole}
                  onClick={() => setRole(candidateRole)}
                  type="button"
                >
                  <p className="text-sm font-semibold capitalize">{candidateRole}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{roleDescriptions[candidateRole]}</p>
                </button>
              ))}
            </div>

            <Button className="w-full" onClick={handleContinue}>
              {isLoading ? "Saving..." : `Continue as ${role}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
