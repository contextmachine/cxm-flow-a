import { createContext, useContext, useEffect, useState } from "react";
import WorkspaceService from "./workspace-service";
import { useAuth } from "../auth-service/auth-provider";
import {
  SceneDto,
  WorkspaceDto,
  WorkspaceUserDto,
} from "./workspace-service.types";
import { Snackbar } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

interface WorkspaceProviderProps {
  workspaceService: WorkspaceService;
  workspaces: WorkspaceDto[];
  activeWorkspace: WorkspaceDto | null;
  activeScenes: SceneDto[];
  activeWorkspaceUsers: WorkspaceUserDto[];
  workspaceLogId: string;
}

const WorkspaceContext = createContext<WorkspaceProviderProps | null>(null);

export function WorkspaceProvider({ children }: any) {
  const { authService } = useAuth();
  const [workspaceService] = useState(() => authService.workspaceService);

  const [workspaces, setWorkspaces] = useState<WorkspaceDto[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceDto | null>(
    null
  );
  const [activeWorkspaceUsers, setActiveWorkspaceUsers] = useState<
    WorkspaceUserDto[]
  >([]);

  const [activeScenes, setActiveScenes] = useState<SceneDto[]>([]);
  const [workspaceLogId, setWorkspaceLogId] = useState<string>(uuidv4());

  const [error, setError] = useState<string>("");

  useEffect(() => {
    workspaceService.provideStates({
      setWorkspaces,
      setActiveWorkspace,
      setActiveScenes,
      setActiveWorkspaceUsers,
      setError,
      setWorkspaceLogId,
    });
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaceService,
        workspaces,
        activeWorkspace,
        activeScenes,
        activeWorkspaceUsers,
        workspaceLogId,
      }}
    >
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
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const service = useContext(WorkspaceContext);

  if (service === null) {
    throw new Error("useWorkspace must be used within a StatesProvider");
  }

  return service;
}
