
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";

import "./App.css";
import Layout from "./Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Brand = lazy(() => import("./pages/Brand"));
const Library = lazy(() => import("./pages/Library"));
const Settings = lazy(() => import("./pages/Settings"));
const Stylizer = lazy(() => import("./pages/Stylizer"));
const Expose = lazy(() => import("./pages/Expose"));
const Publish = lazy(() => import("./pages/Publish"));
const Videographer = lazy(() => import("./pages/Videographer"));
const ProductPhotoShoot = lazy(() => import("./pages/ProductPhotoShoot"));
const FashionModels = lazy(() => import("./pages/FashionModels"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected Routes - require authentication */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/brand" element={<Brand />} />
                <Route path="/library" element={<Library />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/stylizer" element={<Stylizer />} />
                <Route path="/expose" element={<Expose />} />
                <Route path="/publish" element={<Publish />} />
                <Route path="/videographer" element={<Videographer />} />
                <Route path="/product-photo-shoot" element={<ProductPhotoShoot />} />
                <Route path="/fashion-models" element={<FashionModels />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
