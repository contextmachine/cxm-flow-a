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

export interface QueryEntityTreeItem {
  id: string;
  endpoint: string;
  type: QueryType;
  label: string;
  children: QueryEntityTreeItem[];
  loading: boolean;
  queryLoaded: boolean;
  modelLoaded: boolean;
  failed: boolean;
  queryId: number;
}
