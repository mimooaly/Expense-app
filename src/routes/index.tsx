import { RouteObject } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import Login from "../Login";
import Register from "../Register";
import Dashboard from "../Dashboard";
import ExpensesList from "../ExpensesList";
import LandingPage from "../LandingPage";
import Support from "../Support";
import Settings from "../Settings";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "support",
        element: <Support />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "expenses",
        element: <ExpensesList />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
];
