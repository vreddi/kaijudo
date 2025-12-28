import { createFileRoute, redirect } from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import HeroSection from "@/components/hero-section";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  // Show loading state while Convex is checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated (via Clerk + Convex), redirect to dashboard
  // Using throw redirect() is the TanStack Router recommended pattern
  // Checking Convex auth ensures consistency with backend authentication state
  if (isAuthenticated) {
    throw redirect({
      to: "/dashboard",
    });
  }

  // Show hero section for non-authenticated users
  return <HeroSection />;
}
