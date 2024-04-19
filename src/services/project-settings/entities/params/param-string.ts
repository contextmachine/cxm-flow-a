import zod, { ZodSchema, z } from "zod";
import ValidationCore from "../validation-core";

const { v4: uuidv4 } = require("uuid");

const Validators = {
  id: zod.string(),
  name: zod.string(),
};

export class ParamString extends ValidationCore implements ParamStringClassInterface {
  // Define properties based on Zod schema
  public id: string;
  public name: string;

  constructor(entity: any) {
    super();

    // Initialize project settings with default values
    this.id = uuidv4();
    this.name = "";

    if (entity) {
      this.checkValues(entity);
    }
  }

  // Get project metadata as an interface
  public getValues(): ParamStringType {
    // Return all current values in a way that matches the Zod schema
    return Object.keys(Validators).reduce((acc: any, key: string) => {
      acc[key] = (this as any)[key];
      return acc;
    }, {} as ParamStringType);
  }

  protected getValidators(): { [key: string]: ZodSchema } {
    return Validators;
  }

  public get type(): "string" {
    return "string";
  }
}

// Define Zod schema for project metadata
const ParamStringSchema = z.object(Validators);

// Infer TypeScript type from Zod schema
export type ParamStringType = z.infer<typeof ParamStringSchema>;

// Interface extending the inferred type with class-specific methods
interface ParamStringClassInterface extends ParamStringType {
  type: "string";
}

