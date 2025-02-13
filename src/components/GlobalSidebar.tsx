
import { ChevronDown, ChevronRight, Home, Image, Video, Palette, Settings, ChevronLeft } from "lucide-react";
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
import { useState } from "react";

const mainNavItems = [
  {
    title: "Home",
    icon: Home,
    url: "/",
  },
  {
    title: "Stylizer",
    icon: Palette,
    url: "/stylizer",
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
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true);

  const isLibraryRoute = location.pathname.startsWith('/library');

  return (
    <div className="fixed left-0 top-16 bottom-0 z-40">
      <Sidebar className="h-[calc(100vh-4rem)] border-r border-polaris-border">
        <SidebarContent className="space-y-1">
          <SidebarGroup>
            <SidebarGroupLabel>Applications</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`${
                        location.pathname === item.url 
                          ? "bg-[#F6F6F7] border-l-4 border-[#9b87f5]" 
                          : "hover:bg-gray-50"
                      }`}
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

          <div className="h-px bg-polaris-border mx-4" />

          <SidebarGroup>
            <button
              onClick={() => setIsLibraryExpanded(!isLibraryExpanded)}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {isLibraryExpanded ? (
                <ChevronDown className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              Library
            </button>
            {isLibraryExpanded && (
              <SidebarGroupContent>
                <SidebarMenu>
                  {libraryItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`${
                          location.pathname === item.url 
                            ? "bg-[#F6F6F7] border-l-4 border-[#9b87f5]" 
                            : "hover:bg-gray-50"
                        }`}
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
            )}
          </SidebarGroup>

          <div className="h-px bg-polaris-border mx-4" />

          <SidebarGroup>
            <SidebarGroupLabel>Brand</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={`${
                      location.pathname === "/brand" 
                        ? "bg-[#F6F6F7] border-l-4 border-[#9b87f5]" 
                        : "hover:bg-gray-50"
                    }`}
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

          <div className="h-px bg-polaris-border mx-4" />

          <div className="mt-auto">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={`${
                        location.pathname === "/settings" 
                          ? "bg-[#F6F6F7] border-l-4 border-[#9b87f5]" 
                          : "hover:bg-gray-50"
                      }`}
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
