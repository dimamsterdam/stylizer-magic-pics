
import { Home, Image, Video, Palette, Settings, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const mainNavItems = [
  {
    title: "Stylizer",
    icon: Palette,
    url: "/",
  },
  {
    title: "Expose",
    icon: Image,
    url: "/expose",
  },
];

const libraryItems = [
  {
    title: "Images",
    icon: Image,
    url: "/library/images",
  },
  {
    title: "Videos",
    icon: Video,
    url: "/library/videos",
  },
  {
    title: "Expose",
    icon: Image,
    url: "/library/expose",
  },
];

export function GlobalSidebar() {
  const location = useLocation();

  return (
    <div className="fixed left-0 top-16 bottom-0 z-40">
      <Sidebar className="h-[calc(100vh-4rem)] border-r border-polaris-border">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Applications</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={location.pathname === item.url ? "bg-polaris-background" : ""}
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
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
                {libraryItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={location.pathname === item.url ? "bg-polaris-background" : ""}
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Brand</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={location.pathname === "/brand" ? "bg-polaris-background" : ""}
                  >
                    <Link to="/brand" className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      <span>Brand Identity</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <div className="mt-auto">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={location.pathname === "/settings" ? "bg-polaris-background" : ""}
                    >
                      <Link to="/settings" className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </SidebarContent>
        <SidebarTrigger className="absolute -right-3 top-3 bg-white border border-polaris-border rounded-full p-1 hover:bg-polaris-background transition-colors">
          <ChevronLeft className="h-4 w-4 sidebar-expanded:rotate-180 transition-transform duration-200" />
        </SidebarTrigger>
      </Sidebar>
    </div>
  );
}
