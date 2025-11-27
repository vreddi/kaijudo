# Layout Architecture

This document explains how layouts work in the Kaijudo web application using TanStack Router.

## Overview

Layouts in TanStack Router allow you to wrap multiple routes with shared UI components (like sidebars, headers, footers) without repeating code on every page.

## File-Based Routing Structure

```
apps/web/src/routes/
├── __root.tsx                  # Root layout (wraps entire app)
├── index.tsx                   # Home page (/)
├── _dashboard.tsx              # Dashboard layout (shared sidebar)
├── _dashboard.index.tsx        # Dashboard home (/dashboard)
├── _dashboard.matches.tsx      # Matches page (/dashboard/matches)
├── _dashboard.collection.tsx   # Collection page (/dashboard/collection)
└── _dashboard.activity.tsx     # Activity page (/dashboard/activity)
```

## Layout Files

### Underscore Prefix (`_dashboard.tsx`)

Files starting with `_` are **layout routes**. They:
- Wrap child routes with shared UI
- Don't add a URL segment themselves
- Use `<Outlet />` to render child content

**Example**: `_dashboard.tsx`
```tsx
// This wraps all /dashboard/* routes
export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet /> {/* Child routes render here */}
      </SidebarInset>
    </SidebarProvider>
  );
}
```

### Child Routes

Child routes use the layout prefix in their path:

**`_dashboard.index.tsx`** → `/dashboard`
```tsx
export const Route = createFileRoute("/_dashboard/")({
  component: DashboardPage,
});
```

**`_dashboard.matches.tsx`** → `/dashboard/matches`
```tsx
export const Route = createFileRoute("/_dashboard/matches")({
  component: MatchesPage,
});
```

## Current Architecture

### Dashboard Layout (`_dashboard.tsx`)

The dashboard layout provides:
- ✅ **AppSidebar** - Navigation with collapsible sections
- ✅ **Authentication** - Redirects if not logged in
- ✅ **Top Bar** - Search and sidebar trigger
- ✅ **User Context** - Available to all child pages
- ✅ **Consistent Layout** - Same sidebar across all dashboard pages

### Dashboard Pages

All pages under `/dashboard/*` automatically get:
- The sidebar navigation
- Authentication protection
- Consistent styling
- No need to repeat layout code

## Route Hierarchy

```
┌─────────────────────────────────────────┐
│ __root.tsx (Root Layout)                 │
│ ┌─────────────────────────────────────┐ │
│ │ index.tsx (Home Page)                │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ _dashboard.tsx (Dashboard Layout)   │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ _dashboard.index.tsx            │ │ │
│ │ │ (Dashboard Home)                 │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ _dashboard.matches.tsx          │ │ │
│ │ │ (Matches Page)                   │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ _dashboard.collection.tsx       │ │ │
│ │ │ (Collection Page)                │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Adding New Dashboard Pages

To add a new page under the dashboard layout:

1. **Create a new file** under `_dashboard`:
```tsx
// apps/web/src/routes/_dashboard.settings.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="p-6">
      <h1>Settings</h1>
      {/* Your content */}
    </div>
  );
}
```

2. **Add to sidebar navigation** in `_dashboard.tsx`:
```tsx
navItems={[
  // ... existing items
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-4 w-4" />,
  },
]}
```

3. **Done!** The page automatically:
   - Gets the sidebar
   - Is authenticated
   - Has consistent styling

## Nested Layouts

You can nest layouts for more complex structures:

```
_dashboard.tsx                    # Level 1: Dashboard layout
_dashboard.projects.tsx           # Level 2: Projects layout
_dashboard.projects.index.tsx     # /dashboard/projects
_dashboard.projects.$id.tsx       # /dashboard/projects/:id
```

## Benefits

1. **DRY (Don't Repeat Yourself)** - Sidebar defined once
2. **Consistency** - All dashboard pages look the same
3. **Maintainability** - Update sidebar in one place
4. **Performance** - Layout only renders once
5. **Code Organization** - Clear separation of concerns

## Authentication Flow

```
User visits /dashboard/matches
         ↓
_dashboard.tsx beforeLoad hook runs
         ↓
Checks if user is authenticated
         ↓
    ┌─────┴─────┐
    ↓           ↓
Authenticated   Not Authenticated
    ↓           ↓
Render layout   Redirect to /
    ↓
Render child route (_dashboard.matches.tsx)
```

## Best Practices

1. **Layout Responsibilities**:
   - Authentication
   - Navigation
   - Shared UI components
   - Global state/context

2. **Page Responsibilities**:
   - Page-specific content
   - Data fetching
   - Page-specific logic

3. **Avoid**:
   - Don't duplicate auth checks in child pages
   - Don't repeat sidebar/layout code
   - Don't put page-specific logic in layouts

## Migration from Old Structure

**Old** (dashboard.tsx with sidebar code):
```tsx
function DashboardPage() {
  // Auth check
  // Sidebar setup
  // Page content
}
```

**New** (separate layout and page):
```tsx
// _dashboard.tsx (layout)
function DashboardLayout() {
  // Auth check
  // Sidebar setup
  return <Outlet />; // Renders child
}

// _dashboard.index.tsx (page)
function DashboardPage() {
  // Just page content
}
```

## Comparison with Next.js

If you're familiar with Next.js:

| Next.js | TanStack Router |
|---------|-----------------|
| `layout.tsx` | `_layout.tsx` |
| `page.tsx` | `index.tsx` |
| `app/dashboard/layout.tsx` | `_dashboard.tsx` |
| `app/dashboard/page.tsx` | `_dashboard.index.tsx` |
| `app/dashboard/settings/page.tsx` | `_dashboard.settings.tsx` |

## Resources

- [TanStack Router Docs - Route Trees](https://tanstack.com/router/latest/docs/framework/react/guide/route-trees)
- [TanStack Router Docs - Layouts](https://tanstack.com/router/latest/docs/framework/react/guide/layout-routes)
- [TanStack Router Docs - File-Based Routing](https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing)

