import { useEffect } from "react";
import { AppRoutes } from "@/routes/AppRoutes";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const loadClips = useDataStore((state) => state.loadClips);
  const loadTeamInvites = useDataStore((state) => state.loadTeamInvites);
  const loadSchedule = useDataStore((state) => state.loadSchedule);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    void loadClips();
  }, [loadClips]);

  useEffect(() => {
    void loadTeamInvites();
  }, [loadTeamInvites]);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-muted-foreground">Initializing authentication...</p>
      </div>
    );
  }

  return <AppRoutes />;
}
