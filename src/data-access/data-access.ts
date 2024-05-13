import { gql } from "@apollo/client";
import zod, { ZodSchema, z } from "zod";
import { getGQLData, validateObject } from "./utils";
import { apiObjectFromDto } from "./fromDto";

export const getQueries = (sceneId: number) => {
  const query = gql`
    query GetQueries($sceneId: Int!) {
      appv3_scene_by_pk(id: $sceneId) {
        queries {
          id
          endpoint
          type
        }
      }
    }
  `;

  const variables = {
    sceneId: sceneId,
  };

  const queries = getGQLData(query, variables)
    .then((e) => e.data.appv3_scene_by_pk.queries as any[])
    .then((e) => e.map((x) => apiObjectFromDto(x)));

  return queries;
};
