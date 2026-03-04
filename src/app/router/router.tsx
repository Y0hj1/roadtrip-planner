import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../ui/AppLayout";
import { LandingPage } from "../../pages/LandingPage";
import { RoutesPage } from "../../pages/RoutesPage";
import { RouteDetailsPage } from "../../pages/RouteDetailsPage";
import { ManageRoutesPage } from "../../pages/ManageRoutesPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/routes", element: <RoutesPage /> },
      { path: "/routes/:id", element: <RouteDetailsPage /> },
      { path: "/manage", element: <ManageRoutesPage /> }
    ]
  }
]);
