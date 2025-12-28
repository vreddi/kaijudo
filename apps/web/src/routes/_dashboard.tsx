import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
} from "@tanstack/react-router";
import { useUser } from "@clerk/clerk-react";
import {
  ShadcnSidebar as Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from "@kaijudo/react-sidebar";
import {
  Home,
  Trophy,
  Layers,
  Activity,
  Settings,
  HelpCircle,
  ChevronUp,
  User2,
} from "lucide-react";

/**
 * Dashboard Layout Route (Sidebar-15 Style)
 *
 * This is a layout route that provides a feature-rich sidebar for all dashboard pages.
 * Based on shadcn's sidebar-15 block pattern with header, content, and footer sections.
 */
export const Route = createFileRoute("/_dashboard")({
  beforeLoad: ({ context, location }) => {
    return {};
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    throw redirect({
      to: "/",
      search: {
        redirect: "/dashboard",
      },
    });
  }

  return <div></div>;
}
