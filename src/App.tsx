import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Brand from "./pages/Brand";
import Auth from "./pages/Auth";
import Publish from "./pages/Publish";
import GenerationResults from "./pages/GenerationResults";
import Expose from "./pages/Expose";
import Library from "./pages/Library";

const Root = () => {
  return (
    <div className="container py-6">
      <Index />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <NotFound />,
    children: [
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
        path: "generation-results",
        element: <GenerationResults />,
      },
      {
        path: "expose/:id",
        element: <Expose />,
      },
      {
        path: "library",
        element: <Library />,
      },
    ],
  },
  {
    path: "/auth",
    element: <Auth />,
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
