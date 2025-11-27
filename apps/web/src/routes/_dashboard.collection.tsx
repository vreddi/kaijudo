import { createFileRoute } from "@tanstack/react-router";

/**
 * Collection Page
 * 
 * Example of another page under the _dashboard layout
 */
export const Route = createFileRoute("/_dashboard/collection")({
  component: CollectionPage,
});

function CollectionPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-100 mb-6">Collection</h1>
      <p className="text-slate-400">Your card collection will appear here.</p>
    </div>
  );
}

