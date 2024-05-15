import { gql } from "@apollo/client";
import { getGQLData, mutateGQLData } from "./utils";
import { QueryType } from "../viewer/loader/objects/api-object";

export interface QueryRawData {
  id: number;
  scene_id: number;
  endpoint: string;
  name: string;
  type: QueryType;
}

export const getQueries = (sceneId: number) => {
  const query = gql`
    query GetQueries($sceneId: Int!) {
      appv3_scene_by_pk(id: $sceneId) {
        queries {
          id
          scene_id
          endpoint
          type
          name
        }
      }
    }
  `;

  const variables = {
    sceneId: sceneId,
  };

  const queries = getGQLData(query, variables)
    .then((e) => e.data.appv3_scene_by_pk.queries as any[])
    .then((e) => e.map((x) => x as QueryRawData));

  return queries;
};

export const addQuery = (
  endpoint: string,
  name: string,
  scene_id: number,
  type: QueryType
) => {
  const mutation = gql`
    mutation addQuery(
      $endpoint: String!
      $name: String!
      $type: String!
      $scene_id: Int!
    ) {
      insert_appv3_query(
        objects: {
          endpoint: $endpoint
          name: $name
          type: $type
          scene_id: $scene_id
        }
      ) {
        returning {
          id
        }
      }
    }
  `;

  const variables = {
    endpoint,
    name,
    scene_id,
    type,
  };

  const id = mutateGQLData(mutation, variables).then(
    (e) => e.data.insert_appv3_query.id as number
  );

  return id;
};

export const deleteQuery = (id: number) => {
  const mutation = gql`
    mutation deleteQuery($id: Int!) {
      delete_appv3_query_by_pk(id: $id) {
        id
      }
    }
  `;

  const variables = {
    id,
  };

  const deletedId = mutateGQLData(mutation, variables).then(
    (e) => e.data.delete_appv3_query_by_pk.id as number
  );

  return deletedId;
};

export const updateQuery = (data: QueryRawData) => {
  const mutation = gql`
    mutation updateQuery(
      $id: Int!
      $endpoint: String!
      $name: String!
      $type: String!
    ) {
      update_appv3_query_by_pk(
        pk_columns: { id: $id }
        _set: { endpoint: $endpoint, name: $name, type: $type }
      ) {
        id
      }
    }
  `;

  const variables = data;

  const id = mutateGQLData(mutation, variables).then(
    (e) => e.data.update_appv3_query_by_pk.id as number
  );

  return id;
};
