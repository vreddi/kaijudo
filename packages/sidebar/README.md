# @kaijudo/react-sidebar

A generic, reusable sidebar component built on top of shadcn/ui's sidebar component. Accepts menu items as props for easy configuration.

## Installation

```bash
pnpm add @kaijudo/react-sidebar
```

## Components

This package provides two sidebar components:

1. **`Sidebar`** - Generic, flexible sidebar (pass menu items as props)
2. **`AppSidebar`** - Feature-rich sidebar with collapsible sections, search, projects, and user profile

## Usage

### Option 1: AppSidebar (Recommended for full-featured apps)

Perfect for apps needing search, collapsible sections, project organization, and user profiles:

```tsx
import { AppSidebar, SidebarProvider, SidebarInset } from "@kaijudo/react-sidebar"
import { Inbox, Bell, Calendar } from "lucide-react"

function App() {
  return (
    <SidebarProvider>
      <AppSidebar
        workspace={{ name: "My Team", plan: "Pro" }}
        navItems={[
          { id: "inbox", label: "Inbox", href: "/inbox", icon: <Inbox />, shortcut: "2" },
          { id: "activity", label: "Activity", href: "/activity", icon: <Bell />, shortcut: "3" },
          { id: "schedule", label: "Schedule", href: "/schedule", icon: <Calendar />, shortcut: "4" },
        ]}
        sharedItems={[
          { id: "boosts", label: "Boosts", href: "/boosts", icon: <Zap /> },
        ]}
        projects={[
          { id: "p1", label: "Personal", href: "/p1", color: "#10b981" },
        ]}
        user={{ name: "John Doe", email: "john@example.com" }}
        collapsible="icon"
      />
      <SidebarInset>
        {/* Your content */}
      </SidebarInset>
    </SidebarProvider>
  )
}
```

See [`APPSIDEBAR.md`](./APPSIDEBAR.md) for complete documentation and [`examples/widelab-style.tsx`](./examples/widelab-style.tsx) for a full example.

### Option 2: Sidebar (Generic, Simple)

For simpler use cases:

```tsx
import { Sidebar, SidebarTrigger, type SidebarMenuItem, type SidebarGroup } from "@kaijudo/react-sidebar"

const menuGroups: SidebarGroup[] = [
  {
    label: "Navigation",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/dashboard",
        active: true,
      },
      {
        id: "explore",
        label: "Explore",
        href: "/explore",
      },
    ],
  },
]

function App() {
  return (
    <>
      <Sidebar groups={menuGroups} />
      <main>
        <SidebarTrigger />
        {/* Your content */}
      </main>
    </>
  )
}
```

### With Custom Link Component (TanStack Router)

```tsx
import { Link } from "@tanstack/react-router"
import { Sidebar } from "@kaijudo/react-sidebar"

function App() {
  const LinkComponent = ({ to, className, children }) => (
    <Link to={to} className={className}>
      {children}
    </Link>
  )

  return (
    <Sidebar
      groups={menuGroups}
      linkComponent={LinkComponent}
    />
  )
}
```

### With Icons and Badges

```tsx
import { Home, Settings, Bell } from "lucide-react"

const menuGroups: SidebarGroup[] = [
  {
    items: [
      {
        id: "home",
        label: "Home",
        href: "/",
        icon: <Home />,
      },
      {
        id: "settings",
        label: "Settings",
        href: "/settings",
        icon: <Settings />,
        badge: "3",
      },
      {
        id: "notifications",
        label: "Notifications",
        href: "/notifications",
        icon: <Bell />,
        badge: 12,
        tooltip: "View notifications",
      },
    ],
  },
]
```

### With Header and Footer

```tsx
<Sidebar
  header={<div>Logo</div>}
  footer={<div>User Profile</div>}
  groups={menuGroups}
/>
```

## Props

### SidebarProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `groups` | `SidebarGroup[]` | **required** | Menu groups to display |
| `header` | `React.ReactNode` | - | Sidebar header content |
| `footer` | `React.ReactNode` | - | Sidebar footer content |
| `linkComponent` | `ComponentType` | - | Custom link component (defaults to `<a>`) |
| `side` | `"left" \| "right"` | `"left"` | Side of the screen |
| `variant` | `"sidebar" \| "floating" \| "inset"` | `"sidebar"` | Variant style |
| `collapsible` | `"offcanvas" \| "icon" \| "none"` | `"offcanvas"` | Collapsible behavior |
| `defaultOpen` | `boolean` | `true` | Default open state |
| `open` | `boolean` | - | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when open state changes |
| `className` | `string` | - | Additional CSS classes |

### SidebarMenuItem

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Unique identifier |
| `label` | `string` | Label to display |
| `href` | `string` | URL or route path |
| `icon` | `React.ReactNode` | Optional icon component |
| `active` | `boolean` | Whether this item is currently active |
| `badge` | `string \| number` | Optional badge content |
| `tooltip` | `string` | Optional tooltip text (shown when collapsed) |

### SidebarGroup

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Optional label for the group |
| `items` | `SidebarMenuItem[]` | Menu items in this group |

## Advanced Usage

For more advanced customization, you can use the underlying shadcn sidebar components directly:

```tsx
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  // ... other components
} from "@kaijudo/react-sidebar"
```

## Styling

This component uses Tailwind CSS and CSS variables for theming. The consuming application must:

1. **Have Tailwind CSS v4 configured** with `@tailwindcss/vite`
2. **Define CSS variables** in your global CSS file

See [`INTEGRATION.md`](./INTEGRATION.md) for detailed setup instructions and [`CSS_VARIABLES.md`](./CSS_VARIABLES.md) for the complete list of required CSS variables.

### Quick Setup

In your app's global CSS file:

```css
@import 'tailwindcss';

:root {
  /* Base shadcn variables */
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  /* ... */
  
  /* Sidebar variables */
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.141 0.005 285.823);
  --sidebar-primary: oklch(0.21 0.006 285.885);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.967 0.001 286.375);
  --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
  --sidebar-border: oklch(0.92 0.004 286.32);
  --sidebar-ring: oklch(0.871 0.006 286.286);
}

@theme inline {
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  /* ... expose other variables */
}
```

### How It Works

- **Tailwind v4** automatically scans this package and generates CSS for used classes
- **CSS variables** provide theme colors that can be customized per app
- **No bundled CSS** - optimal bundle size and flexibility

## Keyboard Shortcut

Press `Cmd/Ctrl + B` to toggle the sidebar.
