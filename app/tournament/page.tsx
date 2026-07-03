import { AppShell } from "@/components/layout/app-shell";
import { TournamentScreen } from "@/features/tournament/components/tournament-screen";

export default function TournamentPage() {
  return (
    <AppShell>
      <TournamentScreen />
    </AppShell>
  );
}
