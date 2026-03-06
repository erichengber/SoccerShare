import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getHomePathForRole } from "@/lib/roleRouting";
import { useAuthStore } from "@/store/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (!result.success || !result.role) {
        setError(result.error ?? "Unable to sign in.");
        return;
      }

    if (result.onboardingRequired) {
      navigate("/onboarding/player");
      return;
    }

    navigate(getHomePathForRole(result.role));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 md:px-6">
      <div className="mx-auto w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Sign in to your SoccerShare account. Demo accounts use password <strong>demo1234</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  autoComplete="email"
                  disabled={isSubmitting}
                  id="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@school.org"
                  required
                  type="email"
                  value={email}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  id="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  required
                  type="password"
                  value={password}
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button className="w-full" disabled={isSubmitting} type="submit">
                Sign In
              </Button>
            </form>

            <p className="mt-4 text-sm text-muted-foreground">
              No account yet? <Link className="text-primary underline" to="/register">Create one</Link>
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Need instant demo access? <Link className="text-primary underline" to="/select-role">Use role selector</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
