import { createContext, useContext, useEffect, useState } from "react";
import AuthService from "./auth-service";
import { FeatureType, Theme, UserMetadataResponse } from "./auth-service.types";
import { useRouter } from "next/router";
import Loader from "@/components/ui/auth/loader/loader";
import { Snackbar } from "@mui/material";
import GlobalStyle from "@/components/ui/app.styled";

interface AuthProviderProps {
  authService: AuthService;
  userMetadata: UserMetadataResponse;
  themes: Map<string, Theme>;
}

const AuthContext = createContext<AuthProviderProps | null>(null);

export function AuthProvider({ children }: any) {
  const [authService] = useState(() => new AuthService());

  const [userMetadata, setUserMetadata] = useState<UserMetadataResponse>(null);
  const [isUnauthorized, setIsUnauthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [featureMap, setFeatureMap] = useState<Map<FeatureType, boolean>>(
    new Map()
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [themes, setThemes] = useState<Map<string, Theme>>(new Map());

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

  useEffect(() => {
    if (!authService) return;

    const fm = authService.featureMap$.subscribe((map) => {
      setFeatureMap(map);
      setIsDarkMode(map.get("isDarkMode") || false);
    });

    const tm = authService.themes$.subscribe((themes) => {
      setThemes(themes);
    });

    return () => {
      fm.unsubscribe();
      tm.unsubscribe();
    };
  }, [authService]);

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
        themes,
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

      <GlobalStyle darkMode={isDarkMode} />
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
