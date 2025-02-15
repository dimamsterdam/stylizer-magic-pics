
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { GlobalSidebar } from "@/components/GlobalSidebar";
import Expose from "@/pages/Expose";
import Brand from "@/pages/Brand";
import Stylizer from "@/pages/Stylizer";
import GenerationResults from "@/pages/GenerationResults";
import Publish from "@/pages/Publish";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import NavBar from "@/components/NavBar";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/auth';

  if (isAuthRoute) {
    return (
      <main className="min-h-screen w-full">
        <Routes>
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
    );
  }

  return (
    <div className="relative h-full">
      <NavBar />
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden">
          <GlobalSidebar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/expose" element={<Expose />} />
              <Route path="/brand" element={<Brand />} />
              <Route path="/stylizer" element={<Stylizer />} />
              <Route
                path="/generation-results"
                element={<GenerationResults />}
              />
              <Route path="/publish" element={<Publish />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Router>
            <AppContent />
          </Router>
        </TooltipProvider>
      </ThemeProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
