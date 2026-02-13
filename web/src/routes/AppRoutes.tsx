import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { LandingPage } from "@/pages/public/LandingPage";
import { SelectRolePage } from "@/pages/public/SelectRolePage";
import { PlayerOverviewPage } from "@/pages/player/PlayerOverviewPage";
import { PlayerProfilePage } from "@/pages/player/PlayerProfilePage";
import { PlayerClipsPage } from "@/pages/player/PlayerClipsPage";
import { ClipDetailPage } from "@/pages/player/ClipDetailPage";
import { PlayerSchedulePage } from "@/pages/player/PlayerSchedulePage";
import { PrivacySettingsPage } from "@/pages/player/PrivacySettingsPage";
import { ParentOverviewPage } from "@/pages/parent/ParentOverviewPage";
import { ParentPlayersPage } from "@/pages/parent/ParentPlayersPage";
import { ParentPlayerDetailPage } from "@/pages/parent/ParentPlayerDetailPage";
import { CoachOverviewPage } from "@/pages/coach/CoachOverviewPage";
import { CoachRosterPage } from "@/pages/coach/CoachRosterPage";
import { CoachPlayerDetailPage } from "@/pages/coach/CoachPlayerDetailPage";
import { CoachSchedulePage } from "@/pages/coach/CoachSchedulePage";
import { RecruiterTournamentBrowserPage } from "@/pages/recruiter/RecruiterTournamentBrowserPage";
import { RecruiterTournamentDetailPage } from "@/pages/recruiter/RecruiterTournamentDetailPage";
import { RecruiterGameDetailPage } from "@/pages/recruiter/RecruiterGameDetailPage";
import { RecruiterPlayerDetailPage } from "@/pages/recruiter/RecruiterPlayerDetailPage";
import { RecruiterFavoritesPage } from "@/pages/recruiter/RecruiterFavoritesPage";
import { RecruiterSavedClipsPage } from "@/pages/recruiter/RecruiterSavedClipsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<LandingPage />} path="/" />
      <Route element={<SelectRolePage />} path="/select-role" />

      <Route element={<ProtectedRoute allow={["player"]} />}>
        <Route element={<AppShell />}>
          <Route element={<PlayerOverviewPage />} path="/player" />
          <Route element={<PlayerProfilePage />} path="/player/profile" />
          <Route element={<PlayerClipsPage />} path="/player/clips" />
          <Route element={<ClipDetailPage />} path="/player/clips/:clipId" />
          <Route element={<PlayerSchedulePage />} path="/player/schedule" />
          <Route element={<PrivacySettingsPage />} path="/player/settings/privacy" />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allow={["parent"]} />}>
        <Route element={<AppShell />}>
          <Route element={<ParentOverviewPage />} path="/parent" />
          <Route element={<ParentPlayersPage />} path="/parent/players" />
          <Route element={<ParentPlayerDetailPage />} path="/parent/players/:playerId" />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allow={["coach"]} />}>
        <Route element={<AppShell />}>
          <Route element={<CoachOverviewPage />} path="/coach" />
          <Route element={<CoachRosterPage />} path="/coach/roster" />
          <Route element={<CoachPlayerDetailPage />} path="/coach/players/:playerId" />
          <Route element={<CoachSchedulePage />} path="/coach/schedule" />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allow={["recruiter"]} />}>
        <Route element={<AppShell />}>
          <Route element={<RecruiterTournamentBrowserPage />} path="/recruiter" />
          <Route element={<RecruiterTournamentDetailPage />} path="/recruiter/tournaments/:tournamentId" />
          <Route element={<RecruiterGameDetailPage />} path="/recruiter/games/:gameId" />
          <Route element={<RecruiterPlayerDetailPage />} path="/recruiter/players/:playerId" />
          <Route element={<RecruiterFavoritesPage />} path="/recruiter/favorites" />
          <Route element={<RecruiterSavedClipsPage />} path="/recruiter/saved-clips" />
        </Route>
      </Route>

      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
