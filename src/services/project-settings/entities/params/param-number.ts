import zod, { ZodSchema, z } from "zod";
import ValidationCore from "../validation-core";

const { v4: uuidv4 } = require("uuid");

const Validators = {
  id: zod.string(),
  name: zod.string(),
  precision: zod.number(),
};

export class ParamNumber extends ValidationCore implements ParamNumberClassInterface {
  // Define properties based on Zod schema
  public id: string;
  public name: string;
  public precision: number;

  constructor(entity: any) {
    super();

    // Initialize project settings with default values
    this.id = uuidv4();
    this.name = "";
    this.precision = 1;

    if (entity) {
      this.checkValues(entity);
    }
  }

  // Get project metadata as an interface
  public getValues(): ParamNumberType {
    // Return all current values in a way that matches the Zod schema
    return Object.keys(Validators).reduce((acc: any, key: string) => {
      acc[key] = (this as any)[key];
      return acc;
    }, {} as ParamNumberType);
  }

  protected getValidators(): { [key: string]: ZodSchema } {
    return Validators;
  }

  public get type(): "number" {
    return "number";
  }
}

// Define Zod schema for project metadata
const ParamNumberSchema = z.object(Validators);

// Infer TypeScript type from Zod schema
export type ParamNumberType = z.infer<typeof ParamNumberSchema>;

// Interface extending the inferred type with class-specific methods
interface ParamNumberClassInterface extends ParamNumberType {
  type: "number";
}

