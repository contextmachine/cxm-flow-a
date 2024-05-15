import client from "@/components/graphql/client/client";
import { gql } from "@apollo/client";
import { FeatureType, UserMetadataResponse } from "./auth-service.types";
import axios from "axios";
import Cookie from "js-cookie";
import WorkspaceService from "../workspace-service/workspace-service";
import { BehaviorSubject } from "rxjs";

class AuthService {
  private _loading: boolean;
  private _session: Session | null;
  private _isUnauthorized: boolean;
  private _userMetadata: UserMetadataResponse;

  private $setLoading: any;
  private $setUserMetadata: any;
  private $setIsUnauthorized: any;
  private $setError: any;

  private _featureMap$ = new BehaviorSubject<Map<FeatureType, boolean>>(
    new Map()
  );

  private _workspaceService: WorkspaceService;

  constructor() {
    this._loading = true;
    this._isUnauthorized = false;
    this._session = null;

    this._userMetadata = null;
    this._workspaceService = new WorkspaceService(this);
  }

  public async checkSession() {
    this.updateUserMetadata(null);
    this.updateLoading(true);

    const response = await fetch("/api/auth/session");
    if (response.ok) {
      const data = await response.json();
      this._session = data?.user as Session;

      if (this._session) {
        const userMetadata = await this.getUserMetadata();
        this.updateUserMetadata(userMetadata);
        this.updateLoading(false);

        this._workspaceService.fetchWorkspaces();
      } else {
        this.updateUnauthorized(true);
        this.updateLoading(false);
      }
    } else {
      this.updateUnauthorized(true);
      this.updateLoading(false);
    }
  }

  public updateFeatures() {
    const metadata = this.userMetadata;

    console.log("metadata", metadata);

    const theme = metadata?.user_theme?.theme?.name || "light";
    const isDarkMode = theme === "dark";

    const featureMap = new Map<FeatureType, boolean>([
      ["isDarkMode", isDarkMode],
    ]);

    this._featureMap$.next(featureMap);
  }

  public async getUserMetadata() {
    const userId = this._session!.userId;

    const query = gql`
      query GetUser($userId: Int!) {
        appv3_user_by_pk(id: $userId) {
          created_at
          email
          id
          password
          username
          user_theme {
            theme {
              id
              name
            }
            id
          }
        }
      }
    `;

    try {
      const response = await client.query({
        query,
        variables: { userId },
      });

      return response.data.appv3_user_by_pk;
    } catch (error) {
      console.error("Error fetching user metadata:", error);
      return null;
    }
  }

  public async signIn(email: string, password: string) {
    try {
      const { data } = await axios.post("/api/auth/signin", {
        email,
        password,
      });
      Cookie.set("token", data.token, { expires: 1 });

      window.location.href = "/";
    } catch (err: any) {
      this.$setError(err.response?.data?.message || "An error occurred.");

      console.error(
        "Failed to sign in. Please check your credentials and try again."
      );
    }
  }

  public async signOut() {
    Cookie.remove("token");
    window.location.reload();
  }

  public async signUp({
    username,
    email,
    password,
  }: {
    username: string;
    email: string;
    password: string;
  }): Promise<void> {
    try {
      await axios.post("/api/auth/signup", {
        username,
        email,
        password,
      });
      window.location.href = "/signin";
    } catch (err: any) {
      const error =
        err.response?.data?.error || "An error occurred during sign up.";
      this.$setError(error);

      throw new Error(error);
    }
  }

  public provideStates(states: {
    setLoading: any;
    setUserMetadata: any;
    setIsUnauthorized: any;
    setError: any;
  }) {
    this.$setLoading = states.setLoading;
    this.$setUserMetadata = states.setUserMetadata;
    this.$setIsUnauthorized = states.setIsUnauthorized;
    this.$setError = states.setError;

    this.$setLoading(this._loading);
    this.$setUserMetadata(this._userMetadata);
    this.$setIsUnauthorized(this._isUnauthorized);

    this.checkSession();
  }

  public updateUserMetadata(metadata: UserMetadataResponse) {
    this._userMetadata = metadata;
    this.$setUserMetadata(metadata);

    this.updateFeatures();
  }

  public updateLoading(loading: boolean) {
    this._loading = loading;
    this.$setLoading(loading);
  }

  public updateUnauthorized(unauthorized: boolean) {
    this._isUnauthorized = unauthorized;
    this.$setIsUnauthorized(unauthorized);
  }

  public get userMetadata() {
    return this._userMetadata;
  }

  public get workspaceService() {
    return this._workspaceService;
  }

  public get featureMap$() {
    return this._featureMap$.asObservable();
  }

  dispose() {
    this.updateLoading(true);
    this.updateUserMetadata(null);

    this._workspaceService.dispose();
  }
}

interface Session {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}

export default AuthService;
