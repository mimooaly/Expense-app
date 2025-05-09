import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Stack,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import {
  Smartphone,
  Globe,
  Lock,
  BarChart2,
  List,
  DollarSign,
  ArrowRight,
} from "react-feather";
import dashboardImage from "./assets/dashboard.png";
import expensesImage from "./assets/expenses.png";
import iconImage from "./assets/icon.png";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <Box
    sx={{
      p: 4,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: 2,
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: "linear-gradient(90deg, #2E7D32 0%, #4CAF50 100%)",
        borderRadius: "4px 4px 0 0",
      },
    }}
  >
    <Box
      sx={{
        color: "primary.main",
        mb: 1,
        p: 2,
        borderRadius: 2,
        bgcolor: "rgba(46, 125, 50, 0.1)",
      }}
    >
      {icon}
    </Box>
    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
      {title}
    </Typography>
    <Typography
      color="text.secondary"
      sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
    >
      {description}
    </Typography>
  </Box>
);

const LandingPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Box sx={{ bgcolor: "#FAFAFA" }}>
      {/* Minimal Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(8px)",
          boxShadow: "none",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src={iconImage}
              alt="Logo"
              style={{ width: 40, height: 40, marginRight: 8 }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              Penny Logs
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={2}
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            {user ? (
              <>
                <Button
                  component={Link}
                  to="/dashboard"
                  variant="text"
                  size="large"
                  startIcon={<BarChart2 size={20} />}
                  sx={{ fontWeight: 500 }}
                >
                  Dashboard
                </Button>
                <Button
                  component={Link}
                  to="/expenses"
                  variant="text"
                  size="large"
                  startIcon={<List size={20} />}
                  sx={{ fontWeight: 500 }}
                >
                  Expenses
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/login"
                  variant="text"
                  size="large"
                  sx={{ fontWeight: 500 }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    fontWeight: 500,
                    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          pt: { xs: 6, md: 8 },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)",
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 6,
              alignItems: "center",
              py: { xs: 6, md: 8 },
            }}
          >
            <Box sx={{ flex: 1, textAlign: "left" }}>
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2.5rem", md: "4rem" },
                  lineHeight: 1.2,
                  mb: 3,
                  background:
                    "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Track Your Cash Expenses, Anytime, Anywhere
              </Typography>
              <Typography
                variant="h4"
                color="text.secondary"
                sx={{
                  mb: 4,
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                  lineHeight: 1.5,
                }}
              >
                A <span style={{ color: "#8B0000" }}>free</span> and simple
                expense tracker designed for cash-centric countries to promote
                financial health awareness.
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  mb: 4,
                  fontSize: "1.1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Lock size={18} />
                We only ask for your email to login. Your data stays private and
                is never shared or sold.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={20} />}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: 500,
                    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
                  }}
                >
                  Get Started
                </Button>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: 500,
                  }}
                >
                  Login
                </Button>
              </Stack>
            </Box>
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <Box
                component="img"
                src={dashboardImage}
                alt="Dashboard Preview"
                sx={{
                  width: "100%",
                  maxWidth: 350,
                  height: "auto",
                  display: "block",
                  margin: "0 auto",
                  borderRadius: 0.5,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  transform: "perspective(1000px) rotateY(-5deg)",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "perspective(1000px) rotateY(0deg)",
                  },
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2rem", md: "2.5rem" },
                mb: 2,
              }}
            >
              Why Use Penny Logs?
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: "auto" }}
            >
              Simple, secure, and designed specifically for cash-centric
              economies
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 4,
            }}
          >
            <FeatureCard
              icon={<Smartphone size={32} />}
              title="Mobile-First Design"
              description="Track your expenses on the go with our intuitive mobile interface, perfect for quick cash expense logging."
            />
            <FeatureCard
              icon={<Globe size={32} />}
              title="Built for Cash-Centric Countries"
              description="Specifically designed for regions where cash transactions are predominant, making expense tracking accessible to everyone."
            />
            <FeatureCard
              icon={<Lock size={32} />}
              title="Free & Secure"
              description="Completely free to use with secure data storage, ensuring your financial information stays private."
            />
            <FeatureCard
              icon={<BarChart2 size={32} />}
              title="Smart Analytics"
              description="Visualize your spending patterns with interactive charts and insights to make better financial decisions."
            />
            <FeatureCard
              icon={<List size={32} />}
              title="Simple Categorization"
              description="Easily categorize your expenses to understand where your money goes and identify areas for improvement."
            />
            <FeatureCard
              icon={<DollarSign size={32} />}
              title="Financial Health Focus"
              description="Promote better financial habits through regular expense tracking and spending pattern analysis."
            />
          </Box>
        </Container>
      </Box>

      {/* Mission Section */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)",
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 6,
              alignItems: "center",
              py: { xs: 8, md: 12 },
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                }}
              >
                Our Mission
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 3, lineHeight: 1.6 }}
              >
                We believe that financial health awareness should be accessible
                to everyone, regardless of their economic background or
                location.
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, fontSize: "1.1rem", lineHeight: 1.6 }}
              >
                In many countries, cash remains the primary mode of transaction,
                making it challenging for people to track their expenses and
                maintain financial discipline. Penny Logs aims to bridge this
                gap by providing a simple, free, and effective solution for
                expense tracking.
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}
              >
                By making expense tracking accessible and easy, we hope to
                contribute to better financial habits and increased financial
                literacy in cash-centric economies.
              </Typography>
            </Box>
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <Box
                component="img"
                src={expensesImage}
                alt="Expenses List Preview"
                sx={{
                  width: "100%",
                  maxWidth: 350,
                  height: "auto",
                  display: "block",
                  margin: "0 auto",
                  borderRadius: 0.5,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  transform: "perspective(1000px) rotateY(5deg)",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "perspective(1000px) rotateY(0deg)",
                  },
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          px: 2,
          textAlign: "center",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: "2rem", md: "2.5rem" },
            }}
          >
            Ready to Start Tracking?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: "text.secondary",
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            Join thousands of users who are already managing their expenses
            better with Penny Logs.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/register"
            sx={{
              py: 1.5,
              px: 4,
              fontSize: "1.1rem",
              borderRadius: 2,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            Get Started for Free
          </Button>
        </Container>
      </Box>

      {/* Donation Section */}
      <Box
        sx={{
          py: 8,
          px: 2,
          textAlign: "center",
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: "2rem", md: "2.5rem" },
            }}
          >
            Support This Project
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: "text.secondary",
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            Penny Logs is a one-person project built to help people track their
            expenses. Your support helps maintain and improve the app, keeping
            it free and accessible for everyone.
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
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center", sm: "flex-start" },
              gap: 4,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <img
                  src={iconImage}
                  alt="Logo"
                  style={{ width: 32, height: 32, marginRight: 8 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Penny Logs
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Simple expense tracking for cash-centric countries.
              </Typography>
            </Box>

            <Box>
              <Stack spacing={2}>
                <Link
                  to="/support"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Typography color="text.secondary">Support</Typography>
                </Link>
                <Link
                  to="/privacy"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Typography color="text.secondary">Privacy</Typography>
                </Link>
              </Stack>
            </Box>
          </Box>

          <Box
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              pt: 4,
              mt: 4,
              textAlign: "center",
            }}
          >
            <Typography color="text.secondary" variant="body2">
              © {new Date().getFullYear()} Penny Logs. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
