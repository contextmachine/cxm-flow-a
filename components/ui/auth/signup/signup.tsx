import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import { useAuth } from "@/components/services/auth-service/auth-provider";

const SignUp = () => {
  const { authService } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      const result = await authService.signUp({ email, password, username });
    } catch (error: any) {
      console.error(error);
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
          width: "100%",
          maxWidth: "350px",
        }}
      >
        <Typography variant="h6" component="h2">
          Sign Up
        </Typography>

        <TextField
          placeholder="Username"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          placeholder="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        <TextField
          placeholder="Password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />

        <Button
          onClick={handleSignUp}
          fullWidth
          size="large"
          sx={{ marginTop: "18px !important" }}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Sign Up"}
        </Button>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            gap: "9px",
          }}
        >
          <Box>Already have an account?</Box>
          <Link href="/signin">Sign In</Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default SignUp;
