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
} from "@mui/material";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Header: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

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

  // Don't show header on login or register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "#f3f4f6",
        boxShadow: "none",
        borderRadius: "0px",
        borderBottom: "1px solid #e0e0e0",
        marginBottom: "16px",
      }}
    >
      <Toolbar sx={{ px: { xs: 1, sm: 2 }, minHeight: 56 }}>
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <img
            src="/icon.png"
            alt="Logo"
            style={{ width: 56, height: 56, marginRight: 8 }}
          />
          <Typography variant="body1" component="div">
            Penny Logs
          </Typography>
        </Box>
        {user ? (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={handleMenuClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={Boolean(anchorEl) ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl) ? "true" : undefined}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}>
                {getUserInitials(user.displayName)}
              </Avatar>
            </IconButton>
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
                    {user.displayName || "User"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
