import { ApolloQueryResult, QueryResult } from "@apollo/client";
import { ZodSchema, z } from "zod";
import ValidationCore from "./validation-core";

const Validators = {
  name: z.string(),
};

class ProjectAuthor
  extends ValidationCore
  implements ProjectMetadataClassInterface
{
  // Define properties based on Zod schema
  public name: string;

  constructor() {
    super();

    // Manually set defaults for all properties
    this.name = "No Author";
  }

  // Method to update project metadata based on Apollo query result
  public updateFromQuery(query: ApolloQueryResult<any>) {
    const _ = query.data;

    const metadata =
      _.app_scenes_by_pk ||
      _.insert_app_scenes_one ||
      _.update_app_scenes_by_pk;

    const author = metadata?.author;

    if (metadata && author) {
      this.checkValues(author);
    }
  }

  // Method for local updates
  public updateLocally(data: Partial<ProjectAuthorType>) {
    this.checkPartialValues(data);
  }

  // Get project metadata as an interface
  public getValues(): ProjectAuthorType {
    // Return all current values in a way that matches the Zod schema
    return Object.keys(Validators).reduce((acc: any, key: string) => {
      acc[key] = (this as any)[key];
      return acc;
    }, {} as ProjectAuthorType);
  }

  protected getValidators(): { [key: string]: ZodSchema } {
    return Validators;
  }
}

// Define Zod schema for project metadata
const ProjectAuthorSchema = z.object(Validators);

// Infer TypeScript type from Zod schema
export type ProjectAuthorType = z.infer<typeof ProjectAuthorSchema>;

// Interface extending the inferred type with class-specific methods
interface ProjectMetadataClassInterface extends ProjectAuthorType {
  updateFromQuery: (query: QueryResult) => void;
  updateLocally: (data: Partial<ProjectAuthorType>) => void;
  checkValues: (data: any) => void;
  checkPartialValues: (data: any) => void;
  getValues: () => ProjectAuthorType;
}

export default ProjectAuthor;
