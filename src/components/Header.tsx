import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  styled,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { List, BarChart2 } from "react-feather";

interface NavLinkProps {
  active?: boolean;
}

const NavLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== "active",
})<NavLinkProps>(({ theme, active }) => ({
  textDecoration: "none",
  color: active ? theme.palette.success.dark : theme.palette.text.secondary,
  padding: "8px 12px",
  borderRadius: "8px",
  transition: "all 0.2s ease-in-out",
  backgroundColor: active ? "rgba(46, 125, 50, 0.12)" : "transparent",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  "&:hover": {
    backgroundColor: "rgba(46, 125, 50, 0.16)",
    color: theme.palette.success.dark,
  },
}));

const Header: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      handleMenuClose();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getUserInitials = (displayName: string) => {
    return displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Don't show header on landing, login or register pages
  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) {
    return null;
  }

  return (
    <>
      {/* Top Header - Always visible */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: "#f3f4f6",
          boxShadow: "none",
          borderRadius: "0px",
          borderBottom: "1px solid #e0e0e0",
          marginBottom: "16px",
          top: 0,
          bottom: "auto",
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 2 }, minHeight: 56 }}>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Link
              to="/"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src="/icon.png"
                alt="Logo"
                style={{ width: 56, height: 56, marginRight: 8 }}
              />
              <Typography
                variant="body1"
                component="div"
                sx={{ color: "text.primary" }}
              >
                Penny Logs
              </Typography>
            </Link>
          </Box>
          {!isMobile && (
            <Box
              component="nav"
              sx={{
                display: "flex",
                gap: 2,
                mr: 2,
              }}
            >
              <NavLink
                to="/dashboard"
                active={location.pathname === "/dashboard"}
              >
                <BarChart2 size={20} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink
                to="/expenses"
                active={location.pathname === "/expenses"}
              >
                <List size={20} />
                <span>Expenses</span>
              </NavLink>
            </Box>
          )}
          {user && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                onClick={handleMenuClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={Boolean(anchorEl) ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl) ? "true" : undefined}
              >
                <Avatar
                  sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}
                >
                  {getUserInitials(user.displayName)}
                </Avatar>
              </IconButton>
            </Box>
          )}
          {!user && !isMobile && (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Bottom Navigation - Mobile Only */}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            backgroundColor: "#f3f4f6",
            boxShadow: "none",
            borderRadius: "0px",
            borderTop: "1px solid #e0e0e0",
            top: "auto",
            bottom: 0,
          }}
        >
          <Toolbar
            sx={{
              px: 1,
              minHeight: 56,
              justifyContent: "space-around",
            }}
          >
            <Box
              component="nav"
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "space-around",
                alignItems: "center",
              }}
            >
              <Tooltip title="Dashboard" placement="top">
                <NavLink
                  to="/dashboard"
                  active={location.pathname === "/dashboard"}
                >
                  <BarChart2 size={20} />
                </NavLink>
              </Tooltip>
              <Tooltip title="Expenses" placement="top">
                <NavLink
                  to="/expenses"
                  active={location.pathname === "/expenses"}
                >
                  <List size={20} />
                </NavLink>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Account Menu - Shared between mobile and desktop */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem disabled>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="subtitle1">
              {user?.displayName || "User"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </>
  );
};

export default Header;
