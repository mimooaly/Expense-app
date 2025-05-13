import { createBrowserRouter, Outlet, useLocation } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import ExpensesList from "./ExpensesList";
import LandingPage from "./LandingPage";
import Support from "./Support";
import Settings from "./Settings";
import GoogleAnalytics from "./components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/react";
import Header from "./components/Header";
import { Box } from "@mui/material";

const Root = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <>
      <GoogleAnalytics />
      <Analytics />
      <Header />
      <Box sx={{ mt: isLandingPage ? 0 : 8, p: isLandingPage ? 0 : 2 }}>
        <Outlet />
      </Box>
    </>
  );
};

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Root />,
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
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

export default router;
