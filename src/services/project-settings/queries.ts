import { gql } from "@apollo/client";

export const SCENE_FRAGMENT = gql`
  fragment SceneFields on app_scenes {
    id
    title
    description
    author_id
    created_at
    updated_at
    category_id
    project_settings
    thumb
    route
    author {
      name
    }
    category {
      title
      id
    }
    extensions
  }
`;

export const GET_SCENE = gql`
  ${SCENE_FRAGMENT}

  query GetScene($id: uuid!) {
    app_scenes_by_pk(id: $id) {
      ...SceneFields
    }
  }
`;

export const UPDATE_SCENE = gql`
  ${SCENE_FRAGMENT}

  mutation UpdateScene($id: uuid!, $_set: app_scenes_set_input!) {
    update_app_scenes_by_pk(pk_columns: { id: $id }, _set: $_set) {
      ...SceneFields
    }
  }
`;

export const CREATE_SCENE = gql`
  ${SCENE_FRAGMENT}

  mutation CreateScene($object: app_scenes_insert_input!) {
    insert_app_scenes_one(object: $object) {
      ...SceneFields
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    app_categories {
      id
      title
      is_default
    }
  }
`;

export const GET_PARAM_NAMESPACES = gql`
  query GetParamNamespaces {
    app_params {
      id
      name
      params
    }
  }
`;