import zod, { ZodSchema, z } from "zod";
import ValidationCore from "../validation-core";

const { v4: uuidv4 } = require("uuid");

const Validators = {
  id: zod.string(),
  name: zod.string(),
  options: zod.array(zod.string()),
};

export class ParamEnum extends ValidationCore implements ParamEnumClassInterface {
  // Define properties based on Zod schema
  public id: string;
  public name: string;
  public options: string[];

  constructor(entity: any) {
    super();

    // Initialize project settings with default values
    this.id = uuidv4();
    this.name = "";
    this.options = [];

    if (entity) {
      this.checkValues(entity);
    }
  }

  // Get project metadata as an interface
  public getValues(): ParamEnumType {
    // Return all current values in a way that matches the Zod schema
    return Object.keys(Validators).reduce((acc: any, key: string) => {
      acc[key] = (this as any)[key];
      return acc;
    }, {} as ParamEnumType);
  }

  protected getValidators(): { [key: string]: ZodSchema } {
    return Validators;
  }

  public get type(): "enum" {
    return "enum";
  }
}

// Define Zod schema for project metadata
const ParamEnumSchema = z.object(Validators);

// Infer TypeScript type from Zod schema
export type ParamEnumType = z.infer<typeof ParamEnumSchema>;

// Interface extending the inferred type with class-specific methods
interface ParamEnumClassInterface extends ParamEnumType {
  type: "enum";
}

