import React, { useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Container,
} from "@mui/material";
import { useAuth } from "@/components/services/auth-service/auth-provider";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { authService } = useAuth();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    handleSignIn();
  };

  const handleSignIn = async () => {
    try {
      await authService.signIn(email, password);
    } catch (err) {
      setError("Failed to sign in. Please check your email and password.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            maxWidth: "350px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h5" component="h1" gutterBottom>
            Sign In
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              <TextField
                placeholder="Email"
                variant="outlined"
                fullWidth
                value={email}
                name="email"
                autoComplete="cxm-email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                placeholder="Password"
                variant="outlined"
                fullWidth
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                autoComplete="cxm-password"
              />

              <Button
                variant="contained"
                color="primary"
                security="large"
                onClick={handleSignIn}
                sx={{ marginTop: "18px !important" }}
                fullWidth
              >
                Sign In
              </Button>
              {error && <Box>{error}</Box>}

              <Box textAlign="center">
                <Box
                  sx={{ display: "flex", gap: "9px", justifyContent: "center" }}
                >
                  Don&apos;t have an account?
                  <Link href="/signup">Sign up</Link>
                </Box>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignIn;
