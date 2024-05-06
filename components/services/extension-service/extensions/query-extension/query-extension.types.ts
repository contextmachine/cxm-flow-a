import { QueryEntityTreeItem } from "./entities/query-entity.types";

export interface QuerySectionTreeItem {
  id: string;
  label: string;
  children: QueryEntityTreeItem[];
  isQuerySection: boolean;
}
