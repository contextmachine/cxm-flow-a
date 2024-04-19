import { createContext, useContext, useEffect, useState } from "react";
import ProjectSettingsService, {
  Category,
  ParamNamespace,
} from "./project-settings-service";
import { useRouter } from "next/router";
import { ProjectSettingsType } from "./entities/project-settings";
import { ProjectMetadataType } from "./entities/project-metadata";
import { ProjectAuthorType } from "./entities/project_author";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import client from "@/components/graphql/client/client";

interface ProjectSettingsServiceProps {
  projectSettingsService: ProjectSettingsService;
  isReady: boolean;
  settings: ProjectSettingsType | null;
  metadata: ProjectMetadataType | null;
  categories: Category[];
  params: ParamNamespace[];
  extensions: Record<string, any>;
  author: ProjectAuthorType | null;
  client: ApolloClient<NormalizedCacheObject>;
}

export const ProjectSettingsContext = createContext<
  ProjectSettingsServiceProps | undefined
>(undefined);

export function ProjectSettingsProvider({ children }: any) {
  // Router
  const router = useRouter();

  // State
  const [projectSettingsService] = useState(() => new ProjectSettingsService());
  const [isReady, setReady] = useState(false);

  const [settings, setSettings] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [categories, setCategories] = useState([]);
  const [params, setParams] = useState<ParamNamespace[]>([]);
  const [extensions, setExtensions] = useState<Record<string, any>>({});
  const [author, setAuthor] = useState(null);

  useEffect(() => {
    if (!router.isReady || !client) return;

    projectSettingsService.provideStates({
      router,
      client,
      setReady,
      setSettings,
      setMetadata,
      setCategories,
      setParams,
      setExtensions,
      setAuthor,
    });

    return () => {
      projectSettingsService.dispose();
    };
  }, [client, router.isReady]);

  return (
    <ProjectSettingsContext.Provider
      value={{
        projectSettingsService,
        isReady,
        settings,
        metadata,
        categories,
        params,
        extensions,
        author,
        client: client!,
      }}
    >
      {children}
    </ProjectSettingsContext.Provider>
  );
}

export function useProjectSettings() {
  const context = useContext(ProjectSettingsContext);
  if (!context) {
    throw new Error(
      "useProjectSettings must be used within a ProjectSettingsProvider"
    );
  }
  return context;
}
