
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

// Create a client
const queryClient = new QueryClient();

const Root = () => {
  return (
    <>
      <NavBar />
      <div className="container py-6">
        <Outlet />
      </div>
    </>
  );
};

const router = createBrowserRouter([
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
  {
    path: "/auth",
    element: <Auth />,
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
