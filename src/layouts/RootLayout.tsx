import { Outlet, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "../components/Header";

interface RootLayoutProps {
  children?: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <>
      <Header />
      <Box
        sx={{
          mt: isLandingPage ? 0 : 8,
          p: isLandingPage ? 0 : 2,
        }}
      >
        {children || <Outlet />}
      </Box>
    </>
  );
};

export default RootLayout;
