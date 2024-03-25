import { createContext, useContext, useEffect, useState } from "react";
import AuthService from "./auth-service";
import { UserMetadataResponse } from "./auth-service.types";
import { useRouter } from "next/router";
import Loader from "@/components/ui/auth/loader/loader";

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

  const router = useRouter();

  useEffect(() => {
    authService.provideStates({
      setLoading,
      setUserMetadata,
      setIsUnauthorized,
    });
  }, []);

  const isAuthPage =
    router.pathname === "/signin" || router.pathname === "/signup";

  useEffect(() => {
    if (!isAuthPage && isUnauthorized) {
      router.push("/signin");
    }
  }, [isUnauthorized, isAuthPage, loading]);

  return (
    <AuthContext.Provider
      value={{
        authService,
        userMetadata,
      }}
    >
      {(loading || isUnauthorized) && !isAuthPage && <Loader />}

      {children}
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
