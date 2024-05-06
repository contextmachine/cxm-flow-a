export interface TreeObject {
  id: string;
  label: string;
  isMain?: boolean;
  children?: TreeObject[];
}
