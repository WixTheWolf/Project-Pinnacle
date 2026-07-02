import { AppShell } from "@/components/layout/app-shell";
import { TodayScreen } from "@/features/today/components/today-screen";

export default function TodayPage() {
  return (
    <AppShell>
      <TodayScreen />
    </AppShell>
  );
}
