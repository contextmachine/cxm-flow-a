import React, { useState } from "react";
import NextLink from "next/link";
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Container,
  Link,
} from "@mui/material";
import { useAuth } from "@/components/services/auth-service/auth-provider";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { authService } = useAuth();

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
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h5" component="h1" gutterBottom>
            Sign In
          </Typography>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSignIn}
            fullWidth
          >
            Sign In
          </Button>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <Box textAlign="center" mt={2}>
            <Typography variant="body2">
              Don't have an account?{" "}
              <NextLink href="/signup" passHref>
                Sign Up
              </NextLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignIn;
