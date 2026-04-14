import { Link, NavLink, Outlet } from "react-router-dom";
import { CircleUserRound, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAccountPathForRole } from "@/lib/roleRouting";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/domain";

const navByRole: Record<UserRole, { label: string; path: string }[]> = {
  player: [
    { label: "Overview", path: "/player" },
    { label: "Profile", path: "/player/profile" },
    { label: "Clips", path: "/player/clips" },
    { label: "Schedule", path: "/player/schedule" },
  ],
  parent: [
    { label: "Overview", path: "/parent" },
    { label: "Players", path: "/parent/players" },
  ],
  coach: [
    { label: "Team Overview", path: "/coach" },
    { label: "Roster", path: "/coach/roster" },
    { label: "Schedule", path: "/coach/schedule" },
  ],
  recruiter: [
    { label: "Tournaments", path: "/recruiter" },
    { label: "Favorites", path: "/recruiter/favorites" },
    { label: "Saved Clips", path: "/recruiter/saved-clips" },
  ],
};

export function AppShell() {
  const { selectedRole, selectedUserId, signOut } = useAuthStore();
  const { data } = useDataStore();

  if (!selectedRole || !selectedUserId) return null;

  const links = navByRole[selectedRole];
  const user = data.users.find((entry) => entry.id === selectedUserId);
  const accountPath = getAccountPathForRole(selectedRole);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-3 md:px-6">
          <Link className="text-lg font-semibold text-primary" to="/">
            SoccerShare
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild size="icon" variant="ghost">
              <Link aria-label="Open account settings" to={accountPath}>
                <CircleUserRound className="h-5 w-5" />
              </Link>
            </Button>
            <div className="hidden text-right text-sm md:block">
              <p className="font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-muted-foreground capitalize">{selectedRole}</p>
            </div>
            <Button onClick={() => void signOut()} size="sm" variant="outline">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-4 py-6 md:grid-cols-[220px_1fr] md:px-6">
        <aside className="rounded-xl border bg-card p-3">
          <nav className="grid gap-1">
            {links.map((link) => (
              <NavLink
                end={link.path === `/${selectedRole}`}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    isActive &&
                      "bg-primary text-primary-foreground hover:bg-primary",
                  )
                }
                key={link.path}
                to={link.path}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <Separator className="my-3" />
          <p className="px-3 text-xs text-muted-foreground"></p>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
