# Dashboard Layout Setup

The dashboard now uses a **layout pattern** similar to Next.js, where the sidebar is defined once and wraps all dashboard pages.

## File Structure

```
src/routes/
├── _dashboard.tsx              # Layout (sidebar + auth)
├── _dashboard.dashboard.tsx    # Dashboard home page
├── _dashboard.matches.tsx      # Matches page
├── _dashboard.collection.tsx   # Collection page  
└── _dashboard.activity.tsx     # Activity page
```

## URL Mapping

| File | URL | Description |
|------|-----|-------------|
| `_dashboard.tsx` | - | Layout wrapper (no URL) |
| `_dashboard.dashboard.tsx` | `/dashboard` | Dashboard home |
| `_dashboard.matches.tsx` | `/dashboard/matches` | Matches page |
| `_dashboard.collection.tsx` | `/dashboard/collection` | Collection page |
| `_dashboard.activity.tsx` | `/dashboard/activity` | Activity page |

## How It Works

### 1. Layout File (`_dashboard.tsx`)

Provides shared UI for all dashboard pages:
- **AppSidebar** with navigation
- **Authentication** check
- **Top bar** with search
- **Outlet** where child pages render

```tsx
function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar {...config} />
      <SidebarInset>
        <TopBar />
        <Outlet /> {/* Child pages render here */}
      </SidebarInset>
    </SidebarProvider>
  );
}
```

### 2. Page Files (`_dashboard.*.tsx`)

Just contain page content, no sidebar/auth code:

```tsx
function DashboardPage() {
  return (
    <div className="p-6">
      {/* Page content only */}
    </div>
  );
}
```

## Benefits

✅ **No Repetition** - Sidebar defined once  
✅ **Consistent** - All pages have same layout  
✅ **Maintainable** - Update sidebar in one place  
✅ **Automatic Auth** - Layout handles authentication  
✅ **Clean Code** - Pages focus on content only

## Adding New Pages

1. Create file: `src/routes/_dashboard.settings.tsx`
```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="p-6">
      <h1>Settings</h1>
    </div>
  );
}
```

2. Add to sidebar nav in `_dashboard.tsx`:
```tsx
navItems={[
  // ... existing items
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings />,
  },
]}
```

3. Generate routes:
```bash
npx @tanstack/router-cli generate
```

That's it! The page automatically gets the sidebar and authentication.

## Old vs New

### Old (dashboard.tsx)
```tsx
function DashboardPage() {
  // ❌ Auth check
  // ❌ Sidebar setup
  // ❌ Layout code
  // ✅ Page content
}
```

### New (_dashboard.tsx + _dashboard.dashboard.tsx)
```tsx
// _dashboard.tsx (layout)
function DashboardLayout() {
  // ✅ Auth check (once)
  // ✅ Sidebar setup (once)
  return <Outlet />;
}

// _dashboard.dashboard.tsx (page)
function DashboardPage() {
  // ✅ Page content only
}
```

## Accessing Layout From Pages

The layout uses Clerk's `useUser()` hook, which provides user data to all child pages automatically. Pages can access user data like this:

```tsx
import { useUser } from "@clerk/clerk-react";

function MyPage() {
  const { user } = useUser();
  // user data available
}
```

## Testing

Navigate to these URLs to see the layout in action:
- http://localhost:3000/dashboard
- http://localhost:3000/dashboard/matches
- http://localhost:3000/dashboard/collection
- http://localhost:3000/dashboard/activity

All should show the same sidebar with different content.

## Troubleshooting

**Sidebar not showing?**
- Check that you're on a `/dashboard/*` route
- Verify `_dashboard.tsx` is rendering correctly

**Route not found?**
- Run `npx @tanstack/router-cli generate`
- Restart dev server

**Conflicting routes?**
- Ensure old `dashboard.tsx` is renamed to `dashboard.old.tsx`
- Check no duplicate route paths

## Next Steps

1. **Customize the sidebar** in `_dashboard.tsx`
2. **Add more pages** following the pattern
3. **Add nested layouts** for sub-sections if needed

See `LAYOUT_ARCHITECTURE.md` for more details.

