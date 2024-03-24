import { createContext, useContext, useEffect, useState } from "react";
import AuthService from "./auth-service";
import { UserMetadata, UserMetadataResponse } from "./auth-service.types";
import SignIn from "@/components/ui/auth/signin/signin";
import { useRouter } from "next/router";

interface AuthProviderProps {
  authService: AuthService;
  userMetadata: UserMetadataResponse;
}

const AuthContext = createContext<AuthProviderProps | null>(null);

export function AuthProvider({ children }: any) {
  const [authService] = useState(() => new AuthService());

  const [userMetadata, setUserMetadata] = useState<UserMetadataResponse>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();

  useEffect(() => {
    authService.provideStates({ setLoading, setUserMetadata });
  }, []);

  const isAuthPage =
    router.pathname === "/signin" || router.pathname === "/signup";

  return (
    <AuthContext.Provider
      value={{
        authService,
        userMetadata,
      }}
    >
      {loading && <div>Loading...</div>}

      {!loading && !userMetadata && !isAuthPage && (
        <div>
          Redirecting to sign-in...
          {router.push("/signin")}
        </div>
      )}

      {(!loading && userMetadata) || isAuthPage ? children : null}
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
