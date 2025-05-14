import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Drawer,
  IconButton,
  Link,
  styled,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import iconImage from "./assets/icon.png";
import appVideo from "./assets/app.mp4";
import pennyImage from "./assets/penny.png";
import cashImage from "./assets/cash.png";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  Lock,
  Globe,
  List,
  DollarSign,
  Menu as MenuIcon,
  Home,
  Info,
  User,
  FileText,
  RefreshCw,
  LogIn,
  PieChart,
} from "react-feather";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Flag from "react-world-flags";
import { currencyOptions } from "./data/currencyOptions";
import theme from "./theme";
import { Helmet } from "react-helmet-async";

interface NavLinkProps {
  active?: boolean;
}

const NavLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== "active",
})<NavLinkProps>(({ theme, active }) => ({
  textDecoration: "none",
  color: active ? theme.palette.success.dark : theme.palette.primary.main,
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

const currencyCountryMap: Record<string, { code: string; name: string }> = {
  USD: { code: "US", name: "United States" },
  PHP: { code: "PH", name: "Philippines" },
  EGP: { code: "EG", name: "Egypt" },
  INR: { code: "IN", name: "India" },
  CNY: { code: "CN", name: "China" },
  JPY: { code: "JP", name: "Japan" },
  IDR: { code: "ID", name: "Indonesia" },
  NGN: { code: "NG", name: "Nigeria" },
  KES: { code: "KE", name: "Kenya" },
  VND: { code: "VN", name: "Vietnam" },
  KHR: { code: "KH", name: "Cambodia" },
  PKR: { code: "PK", name: "Pakistan" },
  BDT: { code: "BD", name: "Bangladesh" },
  MXN: { code: "MX", name: "Mexico" },
  COP: { code: "CO", name: "Colombia" },
  PEN: { code: "PE", name: "Peru" },
};

const LandingPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: any) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const navLinks = [
    { label: "Home", id: "hero", icon: <Home size={20} /> },
    { label: "Benefits", id: "why", icon: <Info size={20} /> },
    { label: "Currencies", id: "currencies", icon: <Globe size={20} /> },
    { label: "About", id: "about", icon: <User size={20} /> },
    { label: "Donate", id: "support", icon: <DollarSign size={20} /> },
  ];

  return (
    <>
      <Helmet>
        <title>Penny Logs - Track Your Cash Expenses</title>
        <meta
          name="description"
          content="A free and simple expense tracker designed for cash-centric countries to promote financial health awareness."
        />
        <meta
          name="keywords"
          content="expense tracker, cash expenses, financial health, free app"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://yourwebsite.com/" />
      </Helmet>
      <Box
        sx={{
          bgcolor: "#FAFAFA",
          width: "100%",
          overflowX: "hidden",
          m: 0,
          p: 0,
          scrollBehavior: "smooth",
        }}
      >
        {/* Simple Header (hide on /support) */}
        {location.pathname !== "/support" && (
          <Box
            component="header"
            sx={{
              position: "fixed",
              top: 0,
              zIndex: 100,
              width: "100%",
              bgcolor: "#fff",
              boxShadow: "0 2px 8px rgba(60,72,100,0.06)",
              py: 2,
              px: { xs: 2, md: 6 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                fontWeight: 700,
                fontSize: 20,
                color: "#57A556",
                letterSpacing: 1,
              }}
            >
              Penny Logs
            </Box>
            {/* Desktop links */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {navLinks.map((link) => (
                <NavLink
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById(link.id)
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
              <Box
                sx={{
                  display: {
                    md: "flex",
                    borderLeft: "1px solid #e0e0e0",
                    paddingLeft: 8,
                  },
                  gap: 1,
                }}
              >
                {user ? (
                  <NavLink href="/dashboard">
                    <PieChart size={20} />
                    Go to Dashboard
                  </NavLink>
                ) : (
                  <>
                    <NavLink href="/login">
                      <LogIn size={20} />
                      Login
                    </NavLink>
                    <NavLink href="/register">
                      <User size={20} />
                      Register
                    </NavLink>
                  </>
                )}
              </Box>
            </Box>
            {/* Mobile hamburger */}
            <Box sx={{ display: { xs: "block", md: "none" } }}>
              <IconButton onClick={() => setDrawerOpen(true)}>
                <MenuIcon size={28} />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
              >
                <Box
                  sx={{
                    width: 320,
                    p: 3,
                    pt: 6,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.id}
                      href={`#${link.id}`}
                      style={{
                        textDecoration: "none",
                        color: theme.palette.primary.dark,
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        setDrawerOpen(false);
                        setTimeout(() => {
                          document
                            .getElementById(link.id)
                            ?.scrollIntoView({ behavior: "smooth" });
                        }, 150);
                      }}
                    >
                      {link.icon}
                      {link.label}
                    </NavLink>
                  ))}

                  <Box
                    sx={{
                      display: {
                        md: "flex",
                        borderTop: "1px solid #e0e0e0",
                        paddingTop: 8,
                      },
                      gap: 1,
                    }}
                  >
                    {user ? (
                      <NavLink href="/dashboard">
                        <PieChart size={20} />
                        Go to Dashboard
                      </NavLink>
                    ) : (
                      <>
                        <NavLink href="/login">
                          <LogIn size={20} />
                          Login
                        </NavLink>
                        <NavLink href="/register">
                          <User size={20} />
                          Register
                        </NavLink>
                      </>
                    )}
                  </Box>
                </Box>
              </Drawer>
            </Box>
          </Box>
        )}

        {/* Hero Section - Two Column Layout */}
        <Box
          sx={{
            minHeight: "100vh",
            width: "100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f7fafc",
            py: 0,
            mt: "60px",
          }}
          id="hero"
        >
          <Box
            sx={{
              width: "100vw",
              maxWidth: "none",
              px: 0,
              mx: 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                gap: { xs: 6, md: 8 },
                width: "100vw",
                m: 0,
                px: 0,
              }}
            >
              {/* Left Column - Text Content */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: { xs: "center", md: "flex-start" },
                  textAlign: { xs: "center", md: "left" },
                  px: { xs: 2, md: 8 },
                  py: { xs: 6, md: 0 },
                  m: 0,
                }}
              >
                {/* Logo and Title */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 4,
                  }}
                >
                  <img
                    src={iconImage}
                    alt="Logo"
                    style={{ width: 80, height: 80, marginRight: 12 }}
                  />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 400,
                      color: "text.primary",
                    }}
                  >
                    Penny Logs
                  </Typography>
                </Box>

                {/* Main Heading */}
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 300,
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    mb: 3,
                    color: "#57A556",
                    letterSpacing: "-1px",
                    lineHeight: 1.2,
                    maxWidth: 500,
                    fontFamily: "Inter, Helvetica, Arial, sans-serif",
                  }}
                >
                  Track Your Cash Expenses, Anytime, Anywhere
                </Typography>

                {/* Description */}
                <Typography
                  variant="h5"
                  sx={{
                    color: "text.secondary",
                    mb: 4,
                    maxWidth: 600,
                    lineHeight: 1.6,
                  }}
                >
                  A free and simple expense tracker designed for cash-centric
                  countries to promote financial health awareness. Your data
                  stays private and is never shared or sold.
                </Typography>

                {/* CTA Buttons */}
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ width: { xs: "100%", md: "auto" } }}
                >
                  {user ? (
                    <Button
                      variant="contained"
                      size="large"
                      component={Link}
                      href="/dashboard"
                      sx={{
                        borderRadius: 3,
                        px: 5,
                        py: 1.5,
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        width: { xs: "100%", md: "auto" },
                      }}
                    >
                      Go to Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        component={Link}
                        href="/register"
                        sx={{
                          borderRadius: 3,
                          px: 5,
                          py: 1.5,
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          width: { xs: "100%", md: "auto" },
                        }}
                      >
                        Get Started
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        component={Link}
                        href="/login"
                        sx={{
                          borderRadius: 3,
                          px: 5,
                          py: 1.5,
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          width: { xs: "100%", md: "auto" },
                        }}
                      >
                        Login
                      </Button>
                    </>
                  )}
                </Stack>
                <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                  <a
                    href="https://www.producthunt.com/posts/penny-logs?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-penny&#0045;logs"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=964053&theme=light&t=1746975520416"
                      alt="Penny Logs - Track your cash spending — free, simple, and no sign-up. | Product Hunt"
                      style={{ width: 250, height: 54 }}
                      width="250"
                      height="54"
                    />
                  </a>
                </Box>
              </Box>

              {/* Right Column - Video */}
              <Box
                sx={{
                  flex: 1,
                  width: { xs: "100%", md: "50%" },
                  mx: "auto",
                  maxWidth: { xs: 400, md: 600 },
                  px: { xs: 2, md: 8 },
                  py: { xs: 6, md: 1 },
                  m: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Gradient Border Wrapper */}
                <Box
                  sx={{
                    p: "3px",
                    borderRadius: 5,
                    background: "linear-gradient(120deg, #57A556, #FEC34E)",
                    display: "inline-block",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      borderRadius: 4,
                      overflow: "hidden",
                      background: "#fff",
                    }}
                  >
                    <video
                      src={appVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls={false}
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Why Use Penny Logs Section */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            minHeight: { xs: 700, md: 800 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            pt: { xs: 0, md: 0 },
            pb: { xs: 8, md: 12 },
            overflow: "visible",
          }}
          style={{
            background: `url(/bg.svg) top center/cover no-repeat, #f7fafc`,
          }}
          id="why"
        >
          {/* Penny Image - half in, half out */}
          <Box
            sx={{
              position: "absolute",
              top: -140,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
              width: { xs: 220, md: 400 },
              height: { xs: 220, md: 400 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            <img
              src={pennyImage}
              alt="Penny"
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>
          <Box
            sx={{
              mt: { xs: 18, md: 36 },
              width: "100%",
              mx: "auto",
              textAlign: "center",
              zIndex: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" className="sectionTitle">
              Why Use Penny Logs?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 6, fontWeight: 400, maxWidth: 500 }}
            >
              Simple, secure, and designed specifically for cash-centric
              economies
            </Typography>
            {/* Benefit Cards Carousel */}
            <Box sx={{ width: "100%", maxWidth: 900, mx: "auto", mt: 2 }}>
              <Slider
                dots={true}
                infinite={false}
                speed={500}
                slidesToShow={2}
                slidesToScroll={1}
                arrows={true}
                dotsClass="slick-dots"
                responsive={[
                  {
                    breakpoint: 1200,
                    settings: { slidesToShow: 2 },
                  },
                  {
                    breakpoint: 900,
                    settings: { slidesToShow: 1 },
                  },
                  {
                    breakpoint: 600,
                    settings: { slidesToShow: 1 },
                  },
                ]}
              >
                <BenefitCard
                  icon={<List size={32} color="#B6A800" />}
                  title="Customizable Categories"
                  description="Create and customize your expense categories with emojis to make tracking more personal and intuitive."
                />
                <BenefitCard
                  icon={<RefreshCw size={32} color="#57A556" />}
                  title="Auto Recurring Expenses"
                  description="Set up recurring expenses that are automatically added each month, saving you time and ensuring you never miss a payment."
                />
                <BenefitCard
                  icon={<Globe size={32} color="#B6A800" />}
                  title="16 Currencies Support"
                  description="Track expenses in 16 different currencies, perfect for international users or those dealing with multiple currencies."
                />
                <BenefitCard
                  icon={<FileText size={32} color="#57A556" />}
                  title="Export to CSV"
                  description="Export your expense data to CSV format anytime, giving you full control over your financial records."
                />
                <BenefitCard
                  icon={<Lock size={32} color="#B6A800" />}
                  title="Private & Secure"
                  description="Your data stays private. We don't share or sell your information to third parties and we only require your name and email for registration."
                />
                <BenefitCard
                  icon={<DollarSign size={32} color="#57A556" />}
                  title="100% Free"
                  description="Completely free to use with no hidden fees or premium features. Track your expenses without spending a penny."
                />
              </Slider>
            </Box>
          </Box>
        </Box>

        {/* Supported Currencies Section */}
        <Box
          sx={{
            width: "100%",
            bgcolor: "#fff",
            py: { xs: 8, md: 12 },
            px: 0,
          }}
          id="currencies"
        >
          <Box
            sx={{
              maxWidth: 1100,
              mx: "auto",
              px: { xs: 2, md: 0 },
              textAlign: "center",
            }}
          >
            <Typography variant="h4" className="sectionTitle">
              Supported Currencies
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 6, fontWeight: 400 }}
            >
              We support 16 currencies you can convert from and to or set as
              your default
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "row", md: "row" },
                flexWrap: { xs: "nowrap", md: "wrap" },
                justifyContent: { xs: "flex-start", md: "center" },
                alignItems: "stretch",
                gap: 3,
                width: "100%",
                mx: "auto",
                overflowX: { xs: "auto", md: "visible" },
                pb: { xs: 2, md: 0 },
              }}
            >
              {currencyOptions.map((opt) => (
                <Box
                  key={opt.code}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    py: 2,
                    px: 2,
                    minWidth: 200,
                    width: 220,
                    minHeight: 140,
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    boxShadow: "0 2px 12px rgba(46,125,50,0.07)",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "box-shadow 0.2s, transform 0.2s",
                    cursor: "default",
                    mb: 2,
                    "&:hover": {
                      boxShadow: "0 4px 24px rgba(46,125,50,0.13)",
                      transform: "translateY(-2px) scale(1.03)",
                    },
                  }}
                >
                  <Flag
                    code={currencyCountryMap[opt.code]?.code}
                    style={{
                      marginBottom: 8,
                      borderRadius: "999px",
                      width: "40px",
                      height: "40px",
                      objectFit: "cover",
                      objectPosition: "center",
                      border: "1px solid #e0e0e0",
                    }}
                    fallback={
                      <span style={{ fontSize: 32, marginBottom: 8 }}>🏳️</span>
                    }
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 0.5, textAlign: "center" }}
                  >
                    {currencyCountryMap[opt.code]?.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500, textAlign: "center" }}
                  >
                    ({opt.code})
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* About This Project Section */}
        <Box
          sx={{
            width: "100%",
            bgcolor: "#f7fafc",
            py: { xs: 8, md: 12 },
            px: 0,
          }}
          id="about"
        >
          <Box
            sx={{
              maxWidth: 1200,
              mx: "auto",
              px: { xs: 2, md: 0 },
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {/* Left Box - Text */}
            <Box sx={{ flex: 1, mb: { xs: 6, md: 0, textAlign: "left" } }}>
              <Typography variant="h4" className="sectionTitle">
                About This Project
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 3, fontWeight: 400 }}
              >
                Penny Logs is a one-person project. I built this because most
                expense trackers are not designed for cash-first countries.
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, fontSize: "1.1rem", lineHeight: 1.6 }}
              >
                In many countries, cash is still the main way people pay. This
                app helps you track your cash spending easily, for free.
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
              >
                No team. No investors. Just one developer who cares about
                simple, private expense tracking.
              </Typography>
            </Box>
            {/* Right Box - Image */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img
                src={cashImage}
                alt="Cash illustration"
                style={{
                  width: "100%",
                  maxWidth: 300,
                  height: "auto",
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Donation Section - Modern */}
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            px: 0,
            width: "100%",
            bgcolor: "#f7fafc",
            textAlign: "center",
          }}
          id="support"
        >
          <Box
            sx={{
              maxWidth: 480,
              mx: "auto",
              bgcolor: "#fff",
              borderRadius: 4,
              boxShadow: "0 4px 24px rgba(46,125,50,0.10)",
              p: { xs: 4, md: 6 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={{ mb: 2 }}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="24" cy="24" r="24" fill="#E8F5E9" />
                <path
                  d="M24 36s-9-6.6-9-13.2C15 17.2 18.6 14 24 14s9 3.2 9 8.8C33 29.4 24 36 24 36z"
                  fill="#57A556"
                />
              </svg>
            </Box>
            <Typography variant="h4" className="sectionTitle">
              Support This Project
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 3, fontWeight: 400 }}
            >
              Your support helps keep it free and running.
            </Typography>
            <Box
              component="form"
              action="https://www.paypal.com/donate"
              method="post"
              target="_top"
              sx={{ mb: 2 }}
            >
              <input type="hidden" name="business" value="LDX4JYR8WKKWJ" />
              <input type="hidden" name="no_recurring" value="0" />
              <input type="hidden" name="currency_code" value="USD" />
              <input
                type="image"
                src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"
                name="submit"
                title="PayPal - The safer, easier way to pay online!"
                alt="Donate with PayPal button"
                style={{ margin: "0 auto", display: "block" }}
              />
              <img
                alt=""
                src="https://www.paypal.com/en_US/i/scr/pixel.gif"
                width="1"
                height="1"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Your contribution helps keep this project alive and growing
            </Typography>
          </Box>
        </Box>

        {/* Footer - Simple */}
        <Box
          sx={{
            width: "100%",
            bgcolor: "#f7fafc",
            borderTop: "1px solid #e0e0e0",
            py: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary" component="span">
            © {new Date().getFullYear()} Penny Logs
          </Typography>
          <Typography
            variant="body2"
            component={Link}
            href="/support"
            sx={{
              color: "primary.main",
              textDecoration: "none",
              ml: 2,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Need help?
          </Typography>
        </Box>
      </Box>
    </>
  );
};

// Update BenefitCard for flex layout
const BenefitCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <Box
    sx={{
      p: 4,
      bgcolor: "#fff",
      borderRadius: 4,
      boxShadow: "0 2px 12px rgba(46,125,50,0.07)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      margin: "32px 16px",
      border: "1px solid #e0e0e0",
      transition: "box-shadow 0.2s, transform 0.2s",
      "&:hover": {
        boxShadow: "0 4px 24px rgba(46,125,50,0.13)",
        transform: "translateY(-2px) scale(1.03)",
      },
    }}
  >
    <Box sx={{ mb: 1 }}>{icon}</Box>
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
      {title}
    </Typography>
    <Typography
      color="text.secondary"
      sx={{ fontSize: "1.05rem", lineHeight: 1.6 }}
    >
      {description}
    </Typography>
  </Box>
);

export default LandingPage;
