import { LeaderboardClient } from "@/components/leaderboard/leaderboard-client";

export const metadata = { title: "Leaderboard" };

export default function LeaderboardPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">See how you stack up against other candidates.</p>
      </div>
      <LeaderboardClient />
    </div>
  );
}
