import { createContext, useContext, useEffect, useState } from "react";
import WorkspaceService from "./workspace-service";
import { useAuth } from "../auth-service/auth-provider";
import {
  SceneDto,
  WorkspaceDto,
  WorkspaceUserDto,
} from "./workspace-service.types";

interface WorkspaceProviderProps {
  workspaceService: WorkspaceService;
  workspaces: WorkspaceDto[];
  activeWorkspace: WorkspaceDto | null;
  activeScenes: SceneDto[];
  activeWorkspaceUsers: WorkspaceUserDto[];
}

const WorkspaceContext = createContext<WorkspaceProviderProps | null>(null);

export function WorkspaceProvider({ children }: any) {
  const { authService } = useAuth();
  const [workspaceService] = useState(() => authService.workspaceService);

  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceDto | null>(
    null
  );
  const [activeWorkspaceUsers, setActiveWorkspaceUsers] = useState<
    WorkspaceUserDto[]
  >([]);
  const [activeScenes, setActiveScenes] = useState<SceneDto[]>([]);

  console.log("workspaceService", workspaceService);

  useEffect(() => {
    workspaceService.provideStates({
      setWorkspaces,
      setActiveWorkspace,
      setActiveScenes,
      setActiveWorkspaceUsers,
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
      }}
    >
      {children}
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
