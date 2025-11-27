# AppSidebar - Advanced Sidebar Component

A feature-rich sidebar component matching modern app designs with collapsible sections, search, keyboard shortcuts, and user profiles.

## Features

- ✨ **Collapsible** - Support for `icon` and `offcanvas` modes
- 🔍 **Search Bar** - Built-in search with keyboard shortcuts
- ⌨️ **Keyboard Shortcuts** - Display shortcuts next to menu items
- 📁 **Collapsible Sections** - Expandable/collapsible groups for shared items and projects
- 🎨 **Color-coded Projects** - Visual indicators with custom colors
- 👤 **User Profile** - Avatar, name, and email at the bottom
- 📱 **Responsive** - Mobile-friendly with sheet overlay

## Usage

### Basic Example

```tsx
import { AppSidebar, SidebarInset, SidebarProvider } from "@kaijudo/react-sidebar"
import { Inbox, Bell, Calendar, Zap, FileText } from "lucide-react"

function App() {
  return (
    <SidebarProvider>
      <AppSidebar
        workspace={{
          name: "Kaijudo Team",
          plan: "Pro Plan",
        }}
        navItems={[
          {
            id: "inbox",
            label: "Inbox",
            href: "/inbox",
            icon: <Inbox className="h-4 w-4" />,
            shortcut: "2",
            active: true,
          },
          {
            id: "activity",
            label: "Activity",
            href: "/activity",
            icon: <Bell className="h-4 w-4" />,
            shortcut: "3",
            badge: 5,
          },
          {
            id: "schedule",
            label: "Schedule",
            href: "/schedule",
            icon: <Calendar className="h-4 w-4" />,
            shortcut: "4",
          },
        ]}
        sharedItems={[
          {
            id: "boosts",
            label: "Boosts",
            href: "/boosts",
            icon: <Zap className="h-4 w-4" />,
          },
          {
            id: "documents",
            label: "Documents",
            href: "/documents",
            icon: <FileText className="h-4 w-4" />,
          },
        ]}
        projects={[
          { id: "personal", label: "Personal", href: "/projects/personal", color: "#10b981" },
          { id: "business", label: "Business", href: "/projects/business", color: "#8b5cf6" },
          { id: "travel", label: "Travel", href: "/projects/travel", color: "#a78bfa" },
        ]}
        user={{
          name: "Sandra Marx",
          email: "sandra@gmail.com",
          avatar: "/avatar.jpg",
        }}
        onAddProject={() => console.log("Add project")}
        onAddShared={() => console.log("Add shared")}
        onSettingsClick={() => console.log("Settings")}
        onHelpClick={() => console.log("Help")}
        collapsible="icon"
      />
      <SidebarInset>
        {/* Your main content */}
      </SidebarInset>
    </SidebarProvider>
  )
}
```

### With TanStack Router

```tsx
import { Link } from "@tanstack/react-router"
import { AppSidebar } from "@kaijudo/react-sidebar"

const LinkComponent = ({ to, className, children }) => (
  <Link
    to={to}
    className={className}
    activeProps={{ className: "bg-sidebar-accent" }}
  >
    {children}
  </Link>
)

<AppSidebar
  linkComponent={LinkComponent}
  // ... other props
/>
```

### Custom Workspace Logo

```tsx
<AppSidebar
  workspace={{
    name: "My Company",
    plan: "Enterprise",
    logo: (
      <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-lg" />
    ),
  }}
  // ... other props
/>
```

### Custom User Avatar

```tsx
<AppSidebar
  user={{
    name: "John Doe",
    email: "john@example.com",
    avatar: (
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
    ),
  }}
  // ... other props
/>
```

## Props

### AppSidebarProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `workspace` | `object` | - | Workspace/org info with name, plan, and logo |
| `navItems` | `NavItem[]` | `[]` | Main navigation items |
| `sharedItems` | `NavItem[]` | `[]` | Shared section items |
| `projects` | `ProjectItem[]` | `[]` | Project items with colors |
| `user` | `object` | - | User profile with name, email, avatar |
| `searchPlaceholder` | `string` | `"Search"` | Search input placeholder |
| `onSearchChange` | `(value: string) => void` | - | Search change callback |
| `onAddProject` | `() => void` | - | Add project callback |
| `onAddShared` | `() => void` | - | Add shared item callback |
| `onSettingsClick` | `() => void` | - | Settings click callback |
| `onHelpClick` | `() => void` | - | Help click callback |
| `linkComponent` | `ComponentType` | - | Custom link component |
| `side` | `"left" \| "right"` | `"left"` | Sidebar position |
| `variant` | `"sidebar" \| "floating" \| "inset"` | `"sidebar"` | Visual variant |
| `collapsible` | `"offcanvas" \| "icon" \| "none"` | `"icon"` | Collapsible behavior |
| `className` | `string` | - | Additional CSS classes |

### NavItem

```typescript
interface NavItem {
  id: string
  label: string
  href: string
  icon?: React.ReactNode
  shortcut?: string      // Keyboard shortcut (e.g., "2" for ⌘2)
  badge?: string | number // Badge content
  active?: boolean       // Active state
}
```

### ProjectItem

```typescript
interface ProjectItem {
  id: string
  label: string
  href: string
  color?: string         // Hex color for indicator
  icon?: React.ReactNode // Custom icon (overrides color dot)
}
```

## Collapsible Modes

### Icon Mode (Recommended)

Collapses to show only icons. Perfect for desktop apps:

```tsx
<AppSidebar collapsible="icon" />
```

- Collapsed: Shows only icons
- Hover: Shows tooltip with label
- Keyboard: Press `Cmd/Ctrl + B` to toggle

### Offcanvas Mode

Slides in/out from the side. Great for mobile:

```tsx
<AppSidebar collapsible="offcanvas" />
```

- Hidden by default on mobile
- Slides in with overlay
- Closes when clicking outside

### None

Always visible, not collapsible:

```tsx
<AppSidebar collapsible="none" />
```

## Keyboard Shortcuts

The component displays keyboard shortcuts next to menu items. To make them functional, implement global keyboard handlers:

```tsx
import { useHotkeys } from "react-hotkeys-hook"

function App() {
  useHotkeys("cmd+1", () => console.log("Search"))
  useHotkeys("cmd+2", () => router.navigate("/inbox"))
  useHotkeys("cmd+3", () => router.navigate("/activity"))
  useHotkeys("cmd+4", () => router.navigate("/schedule"))
  useHotkeys("cmd+b", () => toggleSidebar())

  return <AppSidebar />
}
```

## Collapsible Sections

The "Shared" and "Projects" sections are collapsible by default. Their state is managed internally:

```tsx
// Sections start expanded
<AppSidebar
  sharedItems={[...]}
  projects={[...]}
/>
```

## Styling

### Color-coded Projects

Projects can have custom colors:

```tsx
projects={[
  { id: "1", label: "Personal", href: "/p1", color: "#10b981" },  // Green
  { id: "2", label: "Business", href: "/p2", color: "#8b5cf6" },  // Purple
  { id: "3", label: "Travel", href: "/p3", color: "#f59e0b" },    // Orange
]}
```

### Custom Icons

Or use custom icons instead of color dots:

```tsx
import { Briefcase, Plane, Home } from "lucide-react"

projects={[
  { id: "1", label: "Personal", href: "/p1", icon: <Home className="h-4 w-4" /> },
  { id: "2", label: "Business", href: "/p2", icon: <Briefcase className="h-4 w-4" /> },
  { id: "3", label: "Travel", href: "/p3", icon: <Plane className="h-4 w-4" /> },
]}
```

## Responsive Behavior

- **Desktop**: Full sidebar with icon collapse
- **Tablet**: Icon mode by default
- **Mobile**: Offcanvas with overlay

The component automatically adapts using the `useIsMobile` hook.

## Advanced Customization

For complete control, you can use the lower-level `Sidebar` component or shadcn components directly:

```tsx
import {
  ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@kaijudo/react-sidebar"

// Build your own custom sidebar
```

## Examples

See the `dashboard.tsx` route in the web app for a complete implementation example.

## Design Inspiration

This component is inspired by modern productivity apps like Linear, Notion, and Slack, featuring:
- Clean visual hierarchy
- Collapsible sections for organization
- Keyboard shortcuts for power users
- Color-coded projects for quick identification
- Prominent search functionality

