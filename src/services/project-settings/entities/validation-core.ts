import { z, ZodSchema } from "zod";

abstract class ValidationCore {
  public isReady: boolean;
  private _showErrors: boolean;

  constructor() {
    this.isReady = false;
    this._showErrors = false;
  }

  protected abstract getValidators(): { [key: string]: ZodSchema };

  // Check if all project metadata are valid
  public checkValues(data: any) {
    const validators = this.getValidators();

    // Step 1: Validate and update individual attributes
    Object.keys(validators).forEach((key) => {
      this._validateAndUpdate(data[key], key, validators[key]);
    });

    // Step 2: Validate the entire object against the Zod schema
    try {
      z.object(validators).parse(this);
      this.isReady = true;
    } catch (err) {
      this.isReady = false;
    }
  }

  public checkPartialValues(data: any) {
    const validators = this.getValidators();

    // Step 1: Validate and update individual attributes
    Object.keys(validators).forEach((key) => {
      if (data[key] !== undefined) {
        this._validateAndUpdate(data[key], key, validators[key]);
      }
    });

    // Step 2: Validate the entire object against the Zod schema
    try {
      z.object(validators).parse(this);
      this.isReady = true;
    } catch (err) {
      this.isReady = false;
    }
  }

  private _validateAndUpdate(value: any, key: string, schema: ZodSchema) {
    if ((value === null || value === undefined) && schema.isNullable()) {
      (this as any)[key] = null;
      return;
    } else {
      try {
        const parsedValue = schema.parse(value);
        (this as any)[key] = parsedValue;
      } catch (err) {
        if (this._showErrors)
          console.error(`Validation failed for key ${key}:`, err);
      }
    }
  }
}

export default ValidationCore;
