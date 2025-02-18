
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Brand from "./pages/Brand";
import Auth from "./pages/Auth";
import Publish from "./pages/Publish";
import Expose from "./pages/Expose";
import Library from "./pages/Library";
import Stylizer from "./pages/Stylizer";
import NavBar from "./components/NavBar";
import { GlobalSidebar } from "./components/GlobalSidebar";
import { SidebarProvider } from "./components/ui/sidebar";

// Create a client
const queryClient = new QueryClient();

const Root = () => {
  return (
    <div className="min-h-screen flex w-full">
      <GlobalSidebar />
      <div className="flex-1">
        <NavBar />
        <div className="container py-6 mt-16">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/",
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "brand",
        element: <Brand />,
      },
      {
        path: "publish",
        element: <Publish />,
      },
      {
        path: "expose",
        element: <Expose />,
      },
      {
        path: "expose/:id",
        element: <Expose />,
      },
      {
        path: "library",
        element: <Library />,
      },
      {
        path: "stylizer",
        element: <Stylizer />,
      }
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </QueryClientProvider>
  );
}

export default App;
