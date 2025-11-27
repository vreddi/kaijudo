import { createFileRoute } from "@tanstack/react-router";

/**
 * Matches Page
 * 
 * Example of another page under the _dashboard layout
 */
export const Route = createFileRoute("/_dashboard/matches")({
  component: MatchesPage,
});

function MatchesPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-100 mb-6">Matches</h1>
      <p className="text-slate-400">Your match history and statistics will appear here.</p>
    </div>
  );
}

