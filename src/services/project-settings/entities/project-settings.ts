import { ApolloQueryResult, QueryResult } from "@apollo/client";
import zod, { ZodSchema, z } from "zod";
import ValidationCore from "./validation-core";
import ProjectSettingsService from "../project-settings-service";

const Validators = {
  camera_near: zod.number(),
  camera_far: zod.number(),
  camera_fov: zod.number(),
  tag_labels_max_count: zod.number(),
  tag_labels_mean_size: zod.number(),
  tag_labels_mean_deviation: zod.number(),
  tag_render_type: zod.enum(["sprite", "svg"]),
  background_color: zod.string(),
  param_namespace: zod
    .string()
    .nullable()
    .refine(
      (value) => {
        return (
          value === null ||
          (value.length > 0 &&
            !(value.toLowerCase() === "null" || value.toLowerCase() === "none"))
        );
      },
      { message: "Namespace must be at least 1 character long" }
    ),
};

class ProjectSettings
  extends ValidationCore
  implements ProjectSettingsClassInterface {
  // Define properties based on Zod schema
  public camera_near: number;
  public camera_far: number;
  public camera_fov: number;
  public tag_labels_max_count: number;
  public tag_labels_mean_size: number;
  public tag_labels_mean_deviation: number;
  public tag_render_type: "sprite" | "svg";
  public background_color: string;
  public param_namespace: string | null;

  constructor(private _projectSettingsService: ProjectSettingsService) {
    super();

    // Initialize project settings with default values
    this.camera_near = 0.001;
    this.camera_far = 100;
    this.camera_fov = 75;
    this.tag_labels_max_count = 100;
    this.tag_labels_mean_size = 2.7;
    this.tag_labels_mean_deviation = 1;
    this.tag_render_type = "svg";
    this.background_color = "#ecf4f3";
    this.param_namespace = "none";
  }

  // Update project settings based on query result
  public updateFromQuery(query: ApolloQueryResult<any>) {
    // update default paramNamespace
    const defaultParamNamespace =
      this._projectSettingsService.defaultParamNamespace;
    if (defaultParamNamespace) {
      this.param_namespace = defaultParamNamespace.id;
    }

    const _ = query.data;

    const metadata =
      _.app_scenes_by_pk ||
      _.insert_app_scenes_one ||
      _.update_app_scenes_by_pk;

    if (metadata && metadata.project_settings) {
      // Parse project settings from string to object
      let ps: any = this._parseProjectSettings(metadata.project_settings);

      if (ps) {
        // Check if any attribute failed validation
        this.checkValues(ps);
      }
    }
  }

  // Method for local updates
  public updateLocally(data: Partial<ProjectSettingsType>) {
    this.checkPartialValues(data);
  }

  // Private method to parse project settings from string to object
  private _parseProjectSettings(projectSettings: string | null) {
    if (projectSettings) {
      try {
        return JSON.parse(projectSettings);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Get project metadata as an interface
  public getValues(): ProjectSettingsType {
    // Return all current values in a way that matches the Zod schema
    return Object.keys(Validators).reduce((acc: any, key: string) => {
      acc[key] = (this as any)[key];
      return acc;
    }, {} as ProjectSettingsType);
  }

  protected getValidators(): { [key: string]: ZodSchema } {
    return Validators;
  }
}

// Define Zod schema for project metadata
const ProjectSettingsSchema = z.object(Validators);

// Infer TypeScript type from Zod schema
export type ProjectSettingsType = z.infer<typeof ProjectSettingsSchema>;

// Interface extending the inferred type with class-specific methods
interface ProjectSettingsClassInterface extends ProjectSettingsType {
  updateFromQuery: (query: QueryResult) => void;
  updateLocally: (data: Partial<ProjectSettingsType>) => void;
  checkValues: (data: any) => void;
  getValues: () => ProjectSettingsType;
}

export default ProjectSettings;
