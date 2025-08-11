import React from 'react';
import { Home, Music, Brain, Layers, Sparkles, Book, Compass, User, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  currentView: 'home' | 'music' | 'meditation' | 'library' | 'explore' | 'admin';
  onViewChange: (view: 'home' | 'music' | 'meditation' | 'library' | 'explore' | 'admin') => void;
}

export function AppSidebar({ currentView, onViewChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const { isAuthenticated } = useAuth();
  const { isAdmin } = useAdminStatus();
  const isCollapsed = state === "collapsed";

  const handleNavClick = (viewId: string) => {
    if ((viewId === 'music' || viewId === 'meditation' || viewId === 'library' || viewId === 'admin') && !isAuthenticated) {
      // Will be handled by parent component to redirect to auth
      return;
    }
    onViewChange(viewId as any);
  };

  const toolItems = [
    { id: 'home', title: 'Home', icon: Home, public: true },
    { id: 'music', title: 'Text to Healing Music', icon: Music, public: false, badge: 'NEW' },
    { id: 'meditation', title: 'Guided Meditation Creator', icon: Brain, public: false },
    { id: 'generate-effects', title: 'Effects & Enhancements', icon: Sparkles, public: false },
  ];

  const libraryItems = [
    { id: 'library', title: 'My Library', icon: Book, public: false },
    { id: 'explore', title: 'Explore Community', icon: Compass, public: true },
  ];

  const adminItems = [
    { id: 'admin', title: 'Admin Panel', icon: Shield, public: false, adminOnly: true },
  ];

  const isActive = (id: string) => {
    return currentView === id;
  };

  const getNavClassName = (id: string) => {
    const active = isActive(id);
    return active 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";
  };

  const filterItems = (items: any[]) => items.filter(item => {
    if (item.adminOnly) return isAuthenticated && isAdmin;
    return item.public || isAuthenticated;
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-24 h-24 rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src="/lovable-uploads/497d3c58-1d67-4a5f-9a1b-529229b57694.png" 
              alt="Indara AI Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-sidebar-foreground">Indara AI</h2>
              <p className="text-xs text-sidebar-foreground/60">Healing Music Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>AI Generation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterItems(toolItems).map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => handleNavClick(item.id)}
                    className={getNavClassName(item.id)}
                  >
                    <item.icon className="w-4 h-4" />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-xs bg-accent text-accent-foreground rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterItems(libraryItems).map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => handleNavClick(item.id)}
                    className={getNavClassName(item.id)}
                  >
                    <item.icon className="w-4 h-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAuthenticated && isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filterItems(adminItems).map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      onClick={() => handleNavClick(item.id)}
                      className={getNavClassName(item.id)}
                    >
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!isCollapsed && (
          <div className="text-xs text-sidebar-foreground/60 text-center">
            Create Calm. Anytime.
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}