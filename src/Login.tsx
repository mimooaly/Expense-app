import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { handleLogin } from "./utils/authUtils";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await handleLogin(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <Container maxWidth="sm" className="marginContainer">
      <img src="/Logo.png" alt="Logo" style={{ width: 120, marginBottom: 1 }} />
      <Box
        component={Paper}
        elevation={0}
        sx={{
          mt: 4,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="h1" gutterBottom>
          Welcome back!
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            autoComplete="email"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>
          <Box sx={{ textAlign: "center" }}>
            <Link href="/register" variant="body2" color="primary.dark">
              Don't have an account? Register
            </Link>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
