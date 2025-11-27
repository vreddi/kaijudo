export { Sidebar, SidebarTrigger, SidebarProviderWrapper } from "./Sidebar"
export type {
  SidebarProps,
  SidebarMenuItem as SidebarMenuItemType,
  SidebarGroup as SidebarGroupType,
} from "./Sidebar"

// Re-export AppSidebar - feature-rich sidebar with collapsible sections
export { AppSidebar } from "./AppSidebar"
export type {
  AppSidebarProps,
  NavItem,
  ProjectItem,
} from "./AppSidebar"

// Re-export shadcn sidebar components for advanced usage
export {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "./components/ui/sidebar"
