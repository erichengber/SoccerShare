import { useEffect } from "react";
import { AppRoutes } from "@/routes/AppRoutes";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const loadClips = useDataStore((state) => state.loadClips);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    void loadClips();
  }, [loadClips]);

  return <AppRoutes />;
}
