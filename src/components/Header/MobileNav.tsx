import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { Dashboard, List, Settings } from "@mui/icons-material";

const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: { xs: "block", sm: "none" },
      }}
      elevation={3}
    >
      <BottomNavigation
        value={location.pathname}
        onChange={handleChange}
        sx={{
          bgcolor: "background.paper",
          "& .MuiBottomNavigationAction-root": {
            color: "text.secondary",
            "&.Mui-selected": {
              color: "success.dark",
            },
          },
        }}
      >
        <BottomNavigationAction
          label="Dashboard"
          value="/dashboard"
          icon={<Dashboard />}
        />
        <BottomNavigationAction
          label="Expenses"
          value="/expenses"
          icon={<List />}
        />
        <BottomNavigationAction
          label="Settings"
          value="/settings"
          icon={<Settings />}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default MobileNav;
