import zod, { ZodSchema, z } from "zod";

const QueryObjectValidator = {
  id: zod.number(),
  endpoint: zod.string(),
};

const QueryObjectSchema = z.object(QueryObjectValidator);
type QueryObject = z.infer<typeof QueryObjectSchema>;

const validateObject = (data: any, zodObject: ZodSchema) => {
  try {
    return zodObject.parse(data);
  } catch (error) {
    console.log(error);
    throw new Error(`validation error for ${data}`);
  }
};

export const apiObjectFromDto = (data: any): QueryObject => {
  return validateObject(data, QueryObjectSchema);
};
