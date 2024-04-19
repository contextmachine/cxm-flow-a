import { ApolloQueryResult, QueryResult } from "@apollo/client";
import { ZodSchema, z } from "zod";
import ValidationCore from "./validation-core";

const { v4: uuidv4 } = require("uuid");

const Validators = {
  id: z.string(),
  title: z.string(),
  description: z.string(),
  author_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  category_id: z.string(),
  thumb: z.string().nullable(),
  route: z.string().nullable(),
};

class ProjectMetadata
  extends ValidationCore
  implements ProjectMetadataClassInterface
{
  // Define properties based on Zod schema
  public id: string;
  public title: string;
  public description: string;
  public author_id: string;
  public created_at: string;
  public updated_at: string;
  public category_id: string;
  public thumb: string | null;
  public route: string | null;

  constructor() {
    super();

    // Manually set defaults for all properties
    this.id = uuidv4();
    this.title = "No title";
    this.description = "";
    this.author_id = "4f648824-f38c-4990-9c6a-e88935b7e5af"; // todo: get from auth
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
    this.category_id = "";
    this.thumb = null;
    this.route = null;
  }

  // Method to update project metadata based on Apollo query result
  public updateFromQuery(query: ApolloQueryResult<any>) {
    const _ = query.data;

    const metadata =
      _.app_scenes_by_pk ||
      _.insert_app_scenes_one ||
      _.update_app_scenes_by_pk;

    if (metadata) {
      // Check if metadata values are valid
      this.checkValues(metadata);
    }
  }

  // Method for local updates
  public updateLocally(data: Partial<ProjectMetadataType>) {
    this.checkPartialValues(data);
  }

  // Get project metadata as an interface
  public getValues(): ProjectMetadataType {
    // Return all current values in a way that matches the Zod schema
    return Object.keys(Validators).reduce((acc: any, key: string) => {
      acc[key] = (this as any)[key];
      return acc;
    }, {} as ProjectMetadataType);
  }

  protected getValidators(): { [key: string]: ZodSchema } {
    return Validators;
  }
}

// Define Zod schema for project metadata
const ProjectMetadataSchema = z.object(Validators);

// Infer TypeScript type from Zod schema
export type ProjectMetadataType = z.infer<typeof ProjectMetadataSchema>;

// Interface extending the inferred type with class-specific methods
interface ProjectMetadataClassInterface extends ProjectMetadataType {
  updateFromQuery: (query: QueryResult) => void;
  updateLocally: (data: Partial<ProjectMetadataType>) => void;
  checkValues: (data: any) => void;
  checkPartialValues: (data: any) => void;
  getValues: () => ProjectMetadataType;
}

export default ProjectMetadata;
