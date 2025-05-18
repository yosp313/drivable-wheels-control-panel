
import { useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";

const Sidebar = () => {
  const { pathname } = useLocation();
  const { collapsed } = useSidebar();

  const getNavClass = ({ isActive }: { isActive: boolean }) => {
    return `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
      isActive 
        ? 'bg-sidebar-accent text-drivable-purple font-medium' 
        : 'hover:bg-sidebar-accent/50'
    }`;
  };

  return (
    <ShadcnSidebar 
      className={`border-r border-border ${collapsed ? "w-16" : "w-64"}`}
      collapsible
    >
      <SidebarContent>
        <div className={`p-4 flex items-center justify-between ${collapsed ? 'justify-center' : ''}`}>
          {!collapsed && (
            <div className="flex items-center">
              <span className="text-2xl font-bold text-drivable-purple">Drivable</span>
            </div>
          )}
          <SidebarTrigger>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </SidebarTrigger>
        </div>
        
        <SidebarGroup defaultOpen>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" end className={getNavClass}>
                    <LayoutDashboard size={20} />
                    {!collapsed && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/users" className={getNavClass}>
                    <Users size={20} />
                    {!collapsed && <span>Users</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/sessions" className={getNavClass}>
                    <Calendar size={20} />
                    {!collapsed && <span>Sessions</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/registrations" className={getNavClass}>
                    <ClipboardList size={20} />
                    {!collapsed && <span>Registrations</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings" className={getNavClass}>
                    <Settings size={20} />
                    {!collapsed && <span>Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </ShadcnSidebar>
  );
};

export default Sidebar;
