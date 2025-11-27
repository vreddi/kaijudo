"use client";

import * as React from "react";
import {
  ChevronRight,
  Layers,
  Plus,
  Search,
  Settings,
  HelpCircle,
  Bell,
  Calendar,
  Inbox,
  Zap,
  FileText,
  ChevronDown,
} from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "./components/ui/sidebar";
import { cn } from "./utils";

// Collapsible component for expandable sections
const Collapsible = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
  }
>(({ children, open: openProp, onOpenChange, defaultOpen, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen ?? false);
  const open = openProp ?? isOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  return (
    <div ref={ref} data-state={open ? "open" : "closed"} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, {
            open,
            onOpenChange: handleOpenChange,
          });
        }
        return child;
      })}
    </div>
  );
});
Collapsible.displayName = "Collapsible";

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ children, open, onOpenChange, onClick, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        onOpenChange?.(!open);
        onClick?.(e);
      }}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
});
CollapsibleTrigger.displayName = "CollapsibleTrigger";

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
  }
>(({ children, open, className, ...props }, ref) => {
  if (!open) return null;
  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
});
CollapsibleContent.displayName = "CollapsibleContent";

// Types
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  shortcut?: string;
  badge?: string | number;
  active?: boolean;
}

export interface ProjectItem {
  id: string;
  label: string;
  href: string;
  color?: string;
  icon?: React.ReactNode;
}

export interface AppSidebarProps {
  /**
   * Organization/workspace info
   */
  workspace?: {
    name: string;
    plan?: string;
    logo?: React.ReactNode;
  };
  /**
   * Main navigation items
   */
  navItems?: NavItem[];
  /**
   * Shared section items
   */
  sharedItems?: NavItem[];
  /**
   * Project items
   */
  projects?: ProjectItem[];
  /**
   * User profile
   */
  user?: {
    name: string;
    email: string;
    avatar?: string | React.ReactNode;
  };
  /**
   * Search placeholder
   */
  searchPlaceholder?: string;
  /**
   * Callbacks
   */
  onSearchChange?: (value: string) => void;
  onAddProject?: () => void;
  onAddShared?: () => void;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
  /**
   * Custom link component
   */
  linkComponent?: React.ComponentType<{
    to: string;
    className?: string;
    children: React.ReactNode;
  }>;
  /**
   * Sidebar props
   */
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
  className?: string;
}

/**
 * AppSidebar - A feature-rich sidebar component matching the widelab design
 * Built on shadcn/ui with collapsible sections, search, projects, and user profile
 */
export function AppSidebar({
  workspace = { name: "Workspace", plan: "Team Plan" },
  navItems = [],
  sharedItems = [],
  projects = [],
  user,
  searchPlaceholder = "Search",
  onSearchChange,
  onAddProject,
  onAddShared,
  onSettingsClick,
  onHelpClick,
  linkComponent: LinkComponent,
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
  className,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const [sharedOpen, setSharedOpen] = React.useState(true);
  const [projectsOpen, setProjectsOpen] = React.useState(true);

  // Default link component
  const DefaultLink = React.useCallback(
    ({
      to,
      className,
      children,
    }: {
      to: string;
      className?: string;
      children: React.ReactNode;
    }) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
    []
  );

  const Link = LinkComponent || DefaultLink;

  return (
    <ShadcnSidebar
      side={side}
      variant={variant}
      collapsible={collapsible}
      className={cn("bg-sidebar", className)}
    >
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-2">
              {workspace.logo || (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-semibold">
                    {workspace.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {workspace.name}
                </p>
                {workspace.plan && (
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {workspace.plan}
                  </p>
                )}
              </div>
              <button className="p-1 hover:bg-sidebar-accent rounded-md transition-colors">
                <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
              </button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Search */}
        <div className="px-2 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/60" />
            <SidebarInput
              placeholder={searchPlaceholder}
              className="pl-8 pr-16"
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 select-none items-center gap-1 rounded border border-sidebar-border bg-sidebar px-1.5 font-mono text-[10px] font-medium text-sidebar-foreground/60 opacity-100">
              <span className="text-xs">⌘</span>1
            </kbd>
          </div>
        </div>

        {/* Main Navigation */}
        {navItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={item.active}>
                      <Link to={item.href}>
                        {item.icon}
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <kbd className="ml-auto inline-flex h-5 select-none items-center gap-1 rounded border border-sidebar-border bg-sidebar-accent/50 px-1.5 font-mono text-[10px] font-medium text-sidebar-foreground/60">
                            <span className="text-xs">⌘</span>
                            {item.shortcut}
                          </kbd>
                        )}
                        {item.badge && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-md bg-sidebar-primary px-1.5 text-xs font-medium text-sidebar-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Shared Section */}
        {sharedItems.length > 0 && (
          <Collapsible open={sharedOpen} onOpenChange={setSharedOpen}>
            <SidebarGroup>
              <div className="flex items-center justify-between px-2">
                <CollapsibleTrigger
                  open={sharedOpen}
                  onOpenChange={setSharedOpen}
                  className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
                >
                  <ChevronRight
                    className={cn(
                      "h-3 w-3 transition-transform",
                      sharedOpen && "rotate-90"
                    )}
                  />
                  Shared
                </CollapsibleTrigger>
                {onAddShared && (
                  <button
                    onClick={onAddShared}
                    className="p-1 hover:bg-sidebar-accent rounded transition-colors"
                  >
                    <Plus className="h-3 w-3 text-sidebar-foreground/60" />
                  </button>
                )}
              </div>
              <CollapsibleContent open={sharedOpen}>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {sharedItems.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild>
                          <Link to={item.href}>
                            {item.icon}
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {/* Projects Section */}
        {projects.length > 0 && (
          <Collapsible open={projectsOpen} onOpenChange={setProjectsOpen}>
            <SidebarGroup>
              <div className="flex items-center justify-between px-2">
                <CollapsibleTrigger
                  open={projectsOpen}
                  onOpenChange={setProjectsOpen}
                  className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
                >
                  <ChevronRight
                    className={cn(
                      "h-3 w-3 transition-transform",
                      projectsOpen && "rotate-90"
                    )}
                  />
                  Projects
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent open={projectsOpen}>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {projects.map((project) => (
                      <SidebarMenuItem key={project.id}>
                        <SidebarMenuButton asChild>
                          <Link to={project.href}>
                            {project.icon || (
                              <div
                                className="h-2 w-2 rounded-sm"
                                style={{ backgroundColor: project.color }}
                              />
                            )}
                            <span>{project.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                    {onAddProject && (
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={onAddProject}>
                          <Plus className="h-4 w-4" />
                          <span className="text-sidebar-foreground/60">
                            Add New Project
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onSettingsClick}>
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onHelpClick}>
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User Profile */}
        {user && (
          <div className="border-t border-sidebar-border mt-2 pt-2">
            <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer">
              {typeof user.avatar === "string" ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
              ) : user.avatar ? (
                user.avatar
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-xs font-medium">
                    {user.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user.email}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
            </div>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </ShadcnSidebar>
  );
}
