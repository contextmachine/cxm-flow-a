import client from "@/components/graphql/client/client";
import { DocumentNode } from "graphql";
import zod, { ZodSchema, z } from "zod";

export const getGQLData = (query: DocumentNode, variables?: any) => {
  try {
    const response = client.query({
      query,
      variables,
      fetchPolicy: "network-only",
    });

    return response;
  } catch (e) {
    throw new Error(`Server error ${e}`);
  }
};

export const mutateGQLData = (mutation: DocumentNode, variables?: any) => {
  try {
    const response = client.mutate({
      mutation,
      variables,
    });

    return response;
  } catch (e) {
    throw new Error(`Server error ${e}`);
  }
};

export const validateObject = (data: any, zodObject: ZodSchema) => {
  try {
    return zodObject.parse(data);
  } catch (error) {
    console.log(error);
    throw new Error(`validation error for ${data}`);
  }
};
