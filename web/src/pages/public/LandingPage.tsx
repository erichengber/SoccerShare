import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-emerald-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-6 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">SoccerShare</p>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="ghost">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/register">Register</Link>
          </Button>
        </div>
      </header>
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
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4">
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
