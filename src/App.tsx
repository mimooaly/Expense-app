import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import ExpensesList from "./ExpensesList";
import LandingPage from "./LandingPage";
import Support from "./Support";
import Header from "./components/Header";
import Settings from "./Settings";
import { Analytics } from "@vercel/analytics/react";
import GoogleAnalytics from "./components/GoogleAnalytics";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2E7D32",
    },
    background: {
      default: "#FAFAFA",
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <GoogleAnalytics />
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/support" element={<Support />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<ExpensesList />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
      <Analytics />
    </ThemeProvider>
  );
}

export default App;
