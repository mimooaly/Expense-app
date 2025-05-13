import { Box, styled } from "@mui/material";
import { ReactNode } from "react";

interface NavLinkProps {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

const StyledNavLink = styled(Box, {
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
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "rgba(46, 125, 50, 0.16)",
    color: theme.palette.success.dark,
  },
}));

const NavLink: React.FC<NavLinkProps> = ({ children, active, onClick }) => {
  return (
    <StyledNavLink active={active} onClick={onClick}>
      {children}
    </StyledNavLink>
  );
};

export default NavLink;
