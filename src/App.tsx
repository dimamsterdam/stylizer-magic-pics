
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Breadcrumbs from "./components/Breadcrumbs";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GenerationResults from "./pages/GenerationResults";
import Publish from "./pages/Publish";
import Expose from "./pages/Expose";
import Brand from "./pages/Brand";
import Settings from "./pages/Settings";
import { GlobalSidebar } from "./components/GlobalSidebar";
import { SidebarProvider } from "./components/ui/sidebar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen bg-polaris-background">
        <BrowserRouter>
          <NavBar />
          <SidebarProvider>
            <div className="flex w-full pt-16">
              <GlobalSidebar />
              <main className="flex-1 transition-[margin] duration-300 ml-[260px] sidebar-collapsed:ml-[80px]">
                <Breadcrumbs />
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/expose" element={<Expose />} />
                  <Route path="/brand" element={<Brand />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/generation-results" element={<GenerationResults />} />
                  <Route path="/publish" element={<Publish />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
