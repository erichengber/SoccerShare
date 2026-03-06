import { useEffect } from "react";
import { AppRoutes } from "@/routes/AppRoutes";
import { useAuthStore } from "@/store/authStore";

export default function App() {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-muted-foreground">Initializing authentication...</p>
      </div>
    );
  }

  return <AppRoutes />;
}
