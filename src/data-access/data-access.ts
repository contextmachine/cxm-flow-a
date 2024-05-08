import client from "@/components/graphql/client/client";
import { gql } from "@apollo/client";
import { DocumentNode } from "graphql";
import { apiObjectFromDto } from "../dto/fromDto";

const getGQLData = (query: DocumentNode, variables?: any) => {
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
