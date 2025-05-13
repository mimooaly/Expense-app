import { Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { Dashboard, List, Settings } from "@mui/icons-material";
import NavLink from "./NavLink";

const DesktopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Dashboard /> },
    { path: "/expenses", label: "Expenses", icon: <List /> },
    { path: "/settings", label: "Settings", icon: <Settings /> },
  ];

  return (
    <Box
      sx={{
        display: { xs: "none", sm: "flex" },
        gap: 1,
        alignItems: "center",
      }}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          active={location.pathname === item.path}
          onClick={() => navigate(item.path)}
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </Box>
  );
};

export default DesktopNav;
