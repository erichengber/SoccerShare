import { useEffect } from "react";
import { AppRoutes } from "@/routes/AppRoutes";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const user = useAuthStore((state) => state.user);
  const selectedRole = useAuthStore((state) => state.selectedRole);
  const loadPlayerDirectory = useDataStore((state) => state.loadPlayerDirectory);
  const loadTeams = useDataStore((state) => state.loadTeams);
  const loadClips = useDataStore((state) => state.loadClips);
  const loadTeamInvites = useDataStore((state) => state.loadTeamInvites);
  const loadSchedule = useDataStore((state) => state.loadSchedule);
  const ensureAuthProfile = useDataStore((state) => state.ensureAuthProfile);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    void loadPlayerDirectory();
  }, [loadPlayerDirectory]);

  useEffect(() => {
    void loadTeams();
  }, [loadTeams]);

  useEffect(() => {
    void loadClips();
  }, [loadClips]);

  useEffect(() => {
    void loadTeamInvites();
  }, [loadTeamInvites]);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  useEffect(() => {
    if (!user || !selectedRole) return;

    ensureAuthProfile({
      authUserId: user.id,
      role: selectedRole,
      email: user.email,
      firstName: typeof user.user_metadata?.first_name === "string" ? user.user_metadata.first_name : undefined,
      lastName: typeof user.user_metadata?.last_name === "string" ? user.user_metadata.last_name : undefined,
      organization: typeof user.user_metadata?.organization === "string" ? user.user_metadata.organization : undefined,
      recruiterRegion:
        typeof user.user_metadata?.recruiter_region === "string" ? user.user_metadata.recruiter_region : undefined
    });
  }, [ensureAuthProfile, selectedRole, user]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-muted-foreground">Initializing authentication...</p>
      </div>
    );
  }

  return <AppRoutes />;
}
