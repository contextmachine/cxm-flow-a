import zod, { ZodSchema, z } from "zod";
import { validateObject } from "./utils";

const QueryObjectValidator = {
  id: zod.number(),
  endpoint: zod.string(),
  type: zod.string(),
};

const QueryObjectSchema = z.object(QueryObjectValidator);
type QueryObject = z.infer<typeof QueryObjectSchema>;

export const apiObjectFromDto = (data: any): QueryObject => {
  return validateObject(data, QueryObjectSchema);
};
