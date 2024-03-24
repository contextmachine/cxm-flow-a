import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link,
  CircularProgress,
} from "@mui/material";
import { gql, useMutation } from "@apollo/client";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      // You might want to add password hashing here before sending it to the server
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      if (response.ok) {
        console.log("Sign up successful");
        router.push("/signin");
      } else {
        console.error("Sign up failed");
      }
    } catch (err) {
      console.error("Error signing up:", err);
    }

    setLoading(false);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: 300,
        }}
      >
        <Typography variant="h6" component="h2">
          Sign Up
        </Typography>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        <TextField
          label="Password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />
        <Button
          onClick={handleSignUp}
          fullWidth
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Sign Up"}
        </Button>

        <Typography variant="body2">
          Already have an account?{" "}
          <Link href="/signin" underline="hover">
            Sign In
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignUp;
