export interface QueryRawData {
  id: number;
  query: {
    id: number;
    endpoint: string;
    name: string;
    type: QueryType;
  };
  query_id: number;
  scene_id: number;
}

export type QueryType = "rest";
