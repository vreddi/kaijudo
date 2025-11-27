import { createFileRoute } from "@tanstack/react-router";

/**
 * Dashboard Home Page
 */
export const Route = createFileRoute("/_dashboard/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      <p className="text-muted-foreground">
        Welcome to your Kaijudo dashboard. This is a clean starting point.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium">Total Games</h3>
          <p className="text-2xl font-bold">24</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium">Win Rate</h3>
          <p className="text-2xl font-bold">67%</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium">Collection</h3>
          <p className="text-2xl font-bold">156</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium">Rank</h3>
          <p className="text-2xl font-bold">Diamond</p>
        </div>
      </div>
    </div>
  );
}
