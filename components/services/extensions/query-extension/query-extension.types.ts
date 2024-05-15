import { QueryType } from "@/src/viewer/loader/objects/api-object";

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

export interface QuerySectionTreeItem {
  id: string;
  label: string;
  children: QueryEntityTreeItem[];
  isQuerySection: boolean;
}
