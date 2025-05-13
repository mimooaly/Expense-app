import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useState } from "react";
import { auth } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import NavLink from "./NavLink";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Don't show header on landing, login, register, or support pages
  if (["/", "/login", "/register", "/support"].includes(location.pathname)) {
    return null;
  }

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "background.paper",
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
          >
            Penny Logs
          </Typography>
          <DesktopNav />
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <NavLink onClick={handleLogout}>Logout</NavLink>
          </Box>
        </Toolbar>
      </AppBar>
      <MobileNav />
    </>
  );
};

export default Header;
