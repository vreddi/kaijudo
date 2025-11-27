import { createFileRoute } from "@tanstack/react-router";

/**
 * Activity Page
 * 
 * Example of another page under the _dashboard layout
 */
export const Route = createFileRoute("/_dashboard/activity")({
  component: ActivityPage,
});

function ActivityPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-100 mb-6">Activity</h1>
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-red-500 text-white text-xs font-medium">
          5
        </span>
        <span className="text-slate-300">New notifications</span>
      </div>
      <p className="text-slate-400">Your activity feed will appear here.</p>
    </div>
  );
}

