/**
 * Example: Widelab-style Sidebar
 * 
 * This example shows how to recreate the sidebar design from the image
 * using the AppSidebar component.
 */

import {
  AppSidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@kaijudo/react-sidebar"
import {
  Inbox,
  Bell,
  Calendar,
  Zap,
  FileText,
  Search,
} from "lucide-react"

export function WidelabStyleExample() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <AppSidebar
          // Workspace/Organization info in header
          workspace={{
            name: "widelab",
            plan: "Team Plan",
            logo: (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white">
                <span className="text-base font-bold">WL</span>
              </div>
            ),
          }}
          
          // Main navigation items with icons and shortcuts
          navItems={[
            {
              id: "inbox",
              label: "Inbox",
              href: "/inbox",
              icon: <Inbox className="h-4 w-4" />,
              shortcut: "2",
            },
            {
              id: "activity",
              label: "Activity",
              href: "/activity",
              icon: <Bell className="h-4 w-4" />,
              shortcut: "3",
            },
            {
              id: "schedule",
              label: "Schedule",
              href: "/schedule",
              icon: <Calendar className="h-4 w-4" />,
              shortcut: "4",
            },
          ]}
          
          // Shared section (collapsible)
          sharedItems={[
            {
              id: "boosts",
              label: "Boosts",
              href: "/shared/boosts",
              icon: <Zap className="h-4 w-4" />,
            },
            {
              id: "documents",
              label: "Documents",
              href: "/shared/documents",
              icon: <FileText className="h-4 w-4" />,
            },
          ]}
          
          // Projects with color indicators
          projects={[
            {
              id: "personal",
              label: "Personal",
              href: "/projects/personal",
              color: "#10b981", // Green
            },
            {
              id: "business",
              label: "Business",
              href: "/projects/business",
              color: "#8b5cf6", // Purple
            },
            {
              id: "travel",
              label: "Travel",
              href: "/projects/travel",
              color: "#a78bfa", // Light purple
            },
          ]}
          
          // User profile at bottom
          user={{
            name: "Sandra Marx",
            email: "sandra@gmail.com",
            avatar: "/avatars/sandra.jpg", // or provide custom avatar component
          }}
          
          // Search configuration
          searchPlaceholder="Search"
          onSearchChange={(value) => {
            console.log("Search:", value)
            // Implement search logic
          }}
          
          // Callbacks
          onAddProject={() => {
            console.log("Add new project")
            // Show create project dialog
          }}
          onAddShared={() => {
            console.log("Add shared item")
            // Show add shared item dialog
          }}
          onSettingsClick={() => {
            console.log("Open settings")
            // Navigate to settings
          }}
          onHelpClick={() => {
            console.log("Open help")
            // Navigate to help or open help modal
          }}
          
          // Sidebar behavior
          collapsible="icon" // Collapses to icon mode
          side="left"
          variant="sidebar"
        />
        
        <SidebarInset>
          {/* Main content area */}
          <div className="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          
          <div className="flex-1 p-6">
            {/* Your main content */}
            <p>Main content goes here</p>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

/**
 * Key Features Implemented:
 * 
 * 1. ✅ Workspace header with logo and team name
 * 2. ✅ Search bar with ⌘1 shortcut
 * 3. ✅ Main nav items (Inbox, Activity, Schedule) with ⌘2-4 shortcuts
 * 4. ✅ Collapsible "Shared" section with + button
 * 5. ✅ Collapsible "Projects" section with colored indicators
 * 6. ✅ "Add New Project" button
 * 7. ✅ Settings and Help at bottom
 * 8. ✅ User profile with avatar, name, email
 * 9. ✅ Icon collapse mode (⌘B to toggle)
 * 10. ✅ Responsive mobile support
 * 
 * Customization Tips:
 * 
 * - Change `collapsible="icon"` to `"offcanvas"` for slide-out behavior
 * - Add custom link component for your router (see APPSIDEBAR.md)
 * - Customize colors in your app's CSS variables
 * - Add more sections by using SidebarGroup components directly
 * - Implement keyboard shortcuts with react-hotkeys-hook or similar
 */

// Example with TanStack Router
import { Link } from "@tanstack/react-router"

export function WidelabStyleWithRouter() {
  const LinkComponent = ({ to, className, children }) => (
    <Link
      to={to}
      className={className}
      activeProps={{
        className: "bg-sidebar-accent font-medium",
      }}
    >
      {children}
    </Link>
  )

  return (
    <SidebarProvider>
      <AppSidebar
        linkComponent={LinkComponent}
        workspace={{ name: "widelab", plan: "Team Plan" }}
        navItems={[
          {
            id: "inbox",
            label: "Inbox",
            href: "/inbox",
            icon: <Inbox className="h-4 w-4" />,
            shortcut: "2",
          },
          // ... other items
        ]}
        // ... other props
      />
      <SidebarInset>
        {/* Content */}
      </SidebarInset>
    </SidebarProvider>
  )
}

// Example with keyboard shortcuts
import { useHotkeys } from "react-hotkeys-hook"
import { useNavigate } from "@tanstack/react-router"

export function WidelabStyleWithHotkeys() {
  const navigate = useNavigate()
  
  // Implement keyboard shortcuts
  useHotkeys("mod+1", () => {
    // Focus search - implement based on your needs
    document.querySelector<HTMLInputElement>('[placeholder="Search"]')?.focus()
  })
  useHotkeys("mod+2", () => navigate({ to: "/inbox" }))
  useHotkeys("mod+3", () => navigate({ to: "/activity" }))
  useHotkeys("mod+4", () => navigate({ to: "/schedule" }))
  // mod+b for sidebar toggle is built-in

  return (
    <SidebarProvider>
      <AppSidebar
        workspace={{ name: "widelab", plan: "Team Plan" }}
        navItems={[...]}
        collapsible="icon"
      />
      <SidebarInset>
        {/* Content */}
      </SidebarInset>
    </SidebarProvider>
  )
}

