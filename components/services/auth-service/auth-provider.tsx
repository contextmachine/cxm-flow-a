import { createContext, useContext, useEffect, useState } from "react";
import AuthService from "./auth-service";
import { UserMetadataResponse } from "./auth-service.types";
import { useRouter } from "next/router";
import Loader from "@/components/ui/auth/loader/loader";
import { Snackbar } from "@mui/material";

interface AuthProviderProps {
  authService: AuthService;
  userMetadata: UserMetadataResponse;
}

const AuthContext = createContext<AuthProviderProps | null>(null);

export function AuthProvider({ children }: any) {
  const [authService] = useState(() => new AuthService());

  const [userMetadata, setUserMetadata] = useState<UserMetadataResponse>(null);
  const [isUnauthorized, setIsUnauthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    authService.provideStates({
      setLoading,
      setUserMetadata,
      setIsUnauthorized,
      setError,
    });
  }, []);

  const isAuthPage =
    router.pathname === "/signin" || router.pathname === "/signup";

  useEffect(() => {
    if (!isAuthPage && isUnauthorized) {
      router.push("/signin");
    }
  }, [isUnauthorized, isAuthPage, loading]);

  useEffect(() => {
    // Redirect to home if the user is authenticated and tries to access signin or signup pages
    if (
      !loading &&
      !isUnauthorized &&
      (router.pathname === "/signin" || router.pathname === "/signup")
    ) {
      router.push("/");
    }
  }, [isUnauthorized, loading, router.pathname]);

  return (
    <AuthContext.Provider
      value={{
        authService,
        userMetadata,
      }}
    >
      {/* {(loading ||
        (!loading && isUnauthorized && !isAuthPage) ||
        (!loading && !isUnauthorized && isAuthPage)) && <Loader />} */}

      {children}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        message={error}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const service = useContext(AuthContext);

  if (service === null) {
    throw new Error("useService must be used within a AuthProvider");
  }

  return service;
}
