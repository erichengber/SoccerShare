import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getHomePathForRole } from "@/lib/roleRouting";
import { useAuthStore } from "@/store/authStore";

export function LandingPage() {
  const { user, selectedRole, isLoading, signInWithEmail, signUpWithEmail } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | undefined>();

  const canSubmit = useMemo(() => email.length > 3 && password.length >= 6 && !isLoading, [email, password, isLoading]);

  if (user && selectedRole) {
    return <Navigate replace to={getHomePathForRole(selectedRole)} />;
  }

  if (user && !selectedRole) {
    return <Navigate replace to="/select-role" />;
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(undefined);

    const maybeError = await signInWithEmail(email.trim(), password);
    if (maybeError) {
      setNotice(maybeError);
    }
  }

  async function handleSignUp() {
    setNotice(undefined);

    const maybeError = await signUpWithEmail(email.trim(), password);
    if (maybeError) {
      setNotice(maybeError);
      return;
    }

    setNotice("Account created. If email confirmation is enabled, verify your inbox and then sign in.");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-emerald-50">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:px-6 lg:grid-cols-[1.2fr_1fr] lg:py-24">
        <section>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">SoccerShare</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
            Soccer highlights built for rec, travel, club, and school pathways.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-700">
            Track development, share clips, and evaluate talent with role-based workflows for players,
            parents, coaches, and recruiters.
          </p>
          <p className="mt-8 max-w-xl text-sm text-slate-600">
            Sign in with Supabase to continue. After authentication, choose your role context for this product MVP.
          </p>
        </section>

        <section className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handleSignIn}>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    autoComplete="email"
                    id="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    autoComplete="current-password"
                    id="password"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 6 characters"
                    type="password"
                    value={password}
                  />
                </div>

                {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button disabled={!canSubmit} size="lg" type="submit">
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  <Button disabled={!canSubmit} onClick={handleSignUp} size="lg" type="button" variant="outline">
                    {isLoading ? "Working..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Player & Parent Flow</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Upload highlights, tag clips, attach games/tournaments, and manage profile privacy.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Coach Flow</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              View linked roster clips across team schedules, including private players on your squad.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recruiter Flow</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Browse tournaments to games to players, favorite profiles, and save clips for follow-up.
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
