import { gql } from "@apollo/client";

export const GET_QUERIES = gql`
  query getQueries($scene_id: uuid!) {
    app_queries(
      where: { scene_id: { _eq: $scene_id } }
      order_by: { index: asc }
    ) {
      author_id
      body
      created_at
      id
      index
      scene_id
      title
      type
      updated_at
      update_author_id
      update_type
      query_dependencies {
        dependent_query_id
        id
        main_query_id
      }
    }
  }
`;

export const ADD_QUERY_MUTATION = gql`
  mutation AddQuery(
    $body: jsonb!
    $title: String!
    $updated_at: timestamptz!
    $update_author_id: uuid!
    $update_type: String!
    $scene_id: uuid!
    $type: String!
    $author_id: uuid!
  ) {
    insert_app_queries_one(
      object: {
        body: $body
        title: $title
        updated_at: $updated_at
        update_type: $update_type
        update_author_id: $update_author_id
        scene_id: $scene_id
        type: $type
        author_id: $author_id
      }
    ) {
      id
    }
  }
`;

export const UPDATE_QUERY_MUTATION = gql`
  mutation UpdateQuery(
    $id: uuid!
    $body: jsonb
    $title: String
    $updated_at: timestamptz
    $update_author_id: uuid
    $update_type: String
    $type: String
  ) {
    update_app_queries_by_pk(
      pk_columns: { id: $id }
      _set: {
        id: $id
        body: $body
        title: $title
        updated_at: $updated_at
        update_type: $update_type
        update_author_id: $update_author_id
        type: $type
      }
    ) {
      id
    }
  }
`;
