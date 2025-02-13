import { ChevronDown, ChevronRight, Home, Image, Video, Palette, Settings, ChevronLeft, Library } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
const mainNavItems = [{
  title: "Home",
  icon: Home,
  url: "/"
}, {
  title: "Stylizer",
  icon: Palette,
  url: "/stylizer"
}, {
  title: "Expose",
  icon: Image,
  url: "/expose"
}];
const libraryItems = [{
  title: "Images",
  icon: Image,
  url: "/library/images"
}, {
  title: "Videos",
  icon: Video,
  url: "/library/videos"
}, {
  title: "Expose",
  icon: Image,
  url: "/library/expose"
}];
export function GlobalSidebar() {
  const location = useLocation();
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(false);
  const isLibraryRoute = location.pathname.startsWith('/library');

  // Auto-expand library section when on a library route
  useEffect(() => {
    if (isLibraryRoute && !isLibraryExpanded) {
      setIsLibraryExpanded(true);
    }
  }, [location.pathname]);
  return <div className="fixed left-0 top-16 bottom-0 z-40">
      <Sidebar className="h-[calc(100vh-4rem)] border-r border-polaris-border">
        <SidebarContent className="space-y-1">
          <SidebarGroup>
            <SidebarGroupLabel>Applications</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map(item => <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className={location.pathname === item.url ? "bg-[#F6F6F7]" : "hover:bg-gray-50"}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className={`h-5 w-5 ${location.pathname === item.url ? "text-black" : ""}`} />
                        <span className={location.pathname === item.url ? "text-black font-medium" : ""}>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <div className="h-px bg-polaris-border mx-4" />

          <SidebarGroup>
            <button onClick={() => setIsLibraryExpanded(!isLibraryExpanded)} className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium ${isLibraryRoute ? "text-black font-medium" : "text-gray-600 hover:text-gray-900"}`}>
              <span className="flex items-center gap-2">
                <Library className={`h-5 w-5 ${isLibraryRoute ? "text-black" : ""}`} />
                <span>Library</span>
              </span>
              {isLibraryExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {isLibraryExpanded && <SidebarGroupContent>
                <SidebarMenu>
                  {libraryItems.map(item => <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className={location.pathname === item.url ? "bg-[#F6F6F7]" : "hover:bg-gray-50"}>
                        <Link to={item.url} className="flex items-center gap-2 px-[40px]">
                          <item.icon className={`h-5 w-5 ${location.pathname === item.url ? "text-black" : ""}`} />
                          <span className={location.pathname === item.url ? "text-black font-medium" : ""}>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>)}
                </SidebarMenu>
              </SidebarGroupContent>}
          </SidebarGroup>

          <div className="h-px bg-polaris-border mx-4" />

          <div className="mt-auto">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={location.pathname === "/settings" ? "bg-[#F6F6F7]" : "hover:bg-gray-50"}>
                      <Link to="/settings" className="flex items-center gap-2">
                        <Settings className={`h-5 w-5 ${location.pathname === "/settings" ? "text-black" : ""}`} />
                        <span className={location.pathname === "/settings" ? "text-black font-medium" : ""}>Settings</span>
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
    </div>;
}