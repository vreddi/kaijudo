import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
} from "@tanstack/react-router";
import { useConvexAuth } from "convex/react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Header } from "@kaijudo/react-header";

/**
 * Dashboard Layout Route (Sidebar-15 Style)
 *
 * This is a layout route that provides a feature-rich sidebar for all dashboard pages.
 * Based on shadcn's sidebar-15 block pattern with header, content, and footer sections.
 */
export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  // Use Convex auth for authentication state (consistent with index route)
  const { isLoading, isAuthenticated } = useConvexAuth();
  // Use Clerk for user profile data (name, email, avatar) since Convex doesn't store this
  const { user } = useUser();
  const { signOut } = useClerk();

  // Show loading state while Convex is checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated (via Clerk + Convex), redirect to home
  if (!isAuthenticated) {
    throw redirect({
      to: "/",
      search: {
        redirect: "/dashboard",
      },
    });
  }

  // Prepare profile data for Header
  const profileData = user
    ? {
        name:
          user.fullName ||
          user.firstName ||
          user.emailAddresses[0]?.emailAddress ||
          "User",
        email: user.emailAddresses[0]?.emailAddress || "",
        avatar: user.imageUrl || "",
      }
    : undefined;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header
        logo={
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-purple-400 via-blue-400 to-teal-400">
              <svg
                className="size-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  fill="currentColor"
                  fillOpacity="0.8"
                />
                <path
                  d="M2 17L12 22L22 17M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-foreground">
              Kaijudo
            </span>
          </Link>
        }
        profile={profileData}
        onSignOut={() => signOut()}
        transparent={true}
      />

      {/* Main Content */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
