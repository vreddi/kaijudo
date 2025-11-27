"use client"

import * as React from "react"
import {
  Sidebar as ShadcnSidebar,
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
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "./components/ui/sidebar"
import { cn } from "./utils"

export interface SidebarMenuItem {
  /**
   * Unique identifier for the menu item
   */
  id: string
  /**
   * Label to display
   */
  label: string
  /**
   * URL or route path
   */
  href: string
  /**
   * Optional icon component
   */
  icon?: React.ReactNode
  /**
   * Whether this item is currently active
   */
  active?: boolean
  /**
   * Optional badge content
   */
  badge?: string | number
  /**
   * Optional tooltip text (shown when sidebar is collapsed)
   */
  tooltip?: string
}

export interface SidebarGroup {
  /**
   * Optional label for the group
   */
  label?: string
  /**
   * Menu items in this group
   */
  items: SidebarMenuItem[]
}

export interface SidebarProps {
  /**
   * Sidebar header content
   */
  header?: React.ReactNode
  /**
   * Sidebar footer content
   */
  footer?: React.ReactNode
  /**
   * Menu groups to display
   */
  groups: SidebarGroup[]
  /**
   * Custom link component (e.g., from @tanstack/react-router, next/link, etc.)
   * If not provided, uses a regular anchor tag
   */
  linkComponent?: React.ComponentType<{ to: string; className?: string; children: React.ReactNode }>
  /**
   * Side of the screen (left or right)
   */
  side?: "left" | "right"
  /**
   * Variant style
   */
  variant?: "sidebar" | "floating" | "inset"
  /**
   * Collapsible behavior
   */
  collapsible?: "offcanvas" | "icon" | "none"
  /**
   * Default open state
   */
  defaultOpen?: boolean
  /**
   * Controlled open state
   */
  open?: boolean
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Generic Sidebar component built on shadcn/ui
 * Accepts menu items as props for easy configuration
 */
export function Sidebar({
  header,
  footer,
  groups,
  linkComponent: LinkComponent,
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
}: SidebarProps) {
  // Default link component (regular anchor tag)
  const DefaultLink = React.useCallback(
    ({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
    []
  )

  const Link = LinkComponent || DefaultLink

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      open={openProp}
      onOpenChange={onOpenChange}
    >
      <ShadcnSidebar side={side} variant={variant} collapsible={collapsible} className={className}>
        {header && <SidebarHeader>{header}</SidebarHeader>}
        
        <SidebarContent>
          {groups.map((group, groupIndex) => (
            <SidebarGroup key={group.label || `group-${groupIndex}`}>
              {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.active}
                        tooltip={item.tooltip || item.label}
                      >
                        <Link to={item.href}>
                          {item.icon}
                          <span>{item.label}</span>
                          {item.badge && (
                            <div className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-md bg-sidebar-primary px-1.5 text-xs font-medium tabular-nums text-sidebar-primary-foreground">
                              {item.badge}
                            </div>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        {footer && <SidebarFooter>{footer}</SidebarFooter>}
        <SidebarRail />
      </ShadcnSidebar>
    </SidebarProvider>
  )
}

export { SidebarTrigger, SidebarProvider as SidebarProviderWrapper }

